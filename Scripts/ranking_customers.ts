import process from "node:process";
import { setImmediate } from "node:timers";

interface Transaction {
    timestamp: number;
    customerId: string;
    amount: number;
}

interface CustomerFrequency {
    customerId: string;
    transactionCount: number;
    totalAmount: number;
}

interface StreamedTransaction {
    timestamp: number;
    customerId: string;
    amount: number;
}

class FrequentCustomersAnalyzer {
    private static readonly DEFAULT_HEAP_THRESHOLD = 2_000_000;
    
    async *generateSyntheticDataStream(count: number = 100_000): AsyncGenerator<StreamedTransaction, void, unknown> {
        // const customerIds = Array.from({length: 5000}, (_, i) => `customer_${i.toString().padStart(5, '0')}`);
        const customerCount = Math.max(
            1000,
            Math.min(
                Math.floor(count / 30),
                500_000
            )
        );

        console.log(`Generando ${customerCount.toLocaleString()} clientes únicos para ${count.toLocaleString()} transacciones`);

        const customerIds = Array.from({length: customerCount}, (_, i) => 
            `customer_${i.toString().padStart(Math.ceil(Math.log10(customerCount + 1)), '0')}`
        );
        
        const activeCustomers = customerIds.slice(0, Math.floor(customerCount * 0.1));
        const regularCustomers = customerIds.slice(
            Math.floor(customerCount * 0.1), 
            Math.floor(customerCount * 0.4)
        );
        const occasionalCustomers = customerIds.slice(Math.floor(customerCount * 0.4));
        
        const now = Date.now();
        const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);
        
        console.log(`Iniciando generación streaming de ${count.toLocaleString()} transacciones...`);
        
        for (let i = 0; i < count; i++) {
            if (i > 0 && i % 1_000_000 === 0) {
                console.log(`Generadas ${i.toLocaleString()} transacciones (${((i/count) * 100).toFixed(1)}%)`);
                await new Promise(resolve => setImmediate(resolve));
            }
            
            let customerId: string;
            const rand = Math.random();
            
            if (rand < 0.6) {
                customerId = activeCustomers[Math.floor(Math.random() * activeCustomers.length)];
            } else if (rand < 0.85) {
                customerId = regularCustomers[Math.floor(Math.random() * regularCustomers.length)];
            } else {
                customerId = occasionalCustomers[Math.floor(Math.random() * occasionalCustomers.length)];
            }
            
            yield {
                timestamp: oneYearAgo + Math.random() * (now - oneYearAgo),
                customerId,
                amount: Math.round((Math.random() * 500 + 10) * 100) / 100
            };
        }
        
        console.log(`Generación completada: ${count.toLocaleString()} transacciones`);
    }

    async getTopFrequentCustomersStreaming(
        dataStream: AsyncGenerator<StreamedTransaction, void, unknown> | StreamedTransaction[],
        startTime: number,
        endTime: number,
        limit: number = 10,
        options: {
            batchSize?: number;
            memoryThreshold?: number;
            enableSpilling?: boolean;
        } = {}
    ): Promise<CustomerFrequency[]> {
        const {
            batchSize = 50000,
            memoryThreshold = FrequentCustomersAnalyzer.DEFAULT_HEAP_THRESHOLD,
            enableSpilling = true
        } = options;

        const customerMap = new Map<string, CustomerFrequency>();
        let processedCount = 0;
        let filteredCount = 0;
        let memoryCheckCounter = 0;
        
        console.log('\nIniciando análisis de clientes frecuentes...');
        console.log(`Parámetros: batchSize=${batchSize.toLocaleString()}, memoryThreshold=${memoryThreshold.toLocaleString()}`);
        
        const startProcessingTime = performance.now();
        
        for await (const transaction of dataStream) {
            processedCount++;
            
            if (transaction.timestamp >= startTime && transaction.timestamp <= endTime) {
                filteredCount++;
                
                const existing = customerMap.get(transaction.customerId);
                if (existing) {
                    existing.transactionCount++;
                    existing.totalAmount += transaction.amount;
                } else {
                    customerMap.set(transaction.customerId, {
                        customerId: transaction.customerId,
                        transactionCount: 1,
                        totalAmount: transaction.amount
                    });
                }
            }
            
            if (++memoryCheckCounter >= batchSize) {
                memoryCheckCounter = 0;
                
                const progress = processedCount;
                console.log(`Procesadas: ${progress.toLocaleString()} | Filtradas: ${filteredCount.toLocaleString()} | Clientes únicos: ${customerMap.size.toLocaleString()}`);
                
                if (enableSpilling && customerMap.size > memoryThreshold) {
                    console.log(`Umbral de memoria alcanzado (${customerMap.size.toLocaleString()} clientes). Optimizando...`);
                    await this.optimizeMemoryUsage(customerMap);
                }
                
                await new Promise(resolve => setImmediate(resolve));
            }
        }
        
        const processingTime = performance.now() - startProcessingTime;
        
        console.log(`\nProcesamiento completado:`);
        console.log(`    Total procesadas: ${processedCount.toLocaleString()}`);
        console.log(`    Transacciones filtradas: ${filteredCount.toLocaleString()}`);
        console.log(`    Clientes únicos: ${customerMap.size.toLocaleString()}`);
        console.log(`    Tiempo de procesamiento: ${(processingTime/1000).toFixed(2)}s`);
        console.log(`    Throughput: ${Math.round(processedCount / (processingTime/1000)).toLocaleString()} transacciones/segundo`);

        return this.partialSort(customerMap, limit);
    }

    private partialSort(customerMap: Map<string, CustomerFrequency>, limit: number): CustomerFrequency[] {
        const customers = Array.from(customerMap.values());

        const compare = (a: CustomerFrequency, b: CustomerFrequency): number => {
            if (b.transactionCount !== a.transactionCount) {
                return b.transactionCount - a.transactionCount;
            }
            return b.totalAmount - a.totalAmount;
        };

        customers.sort(compare);
        return customers.length <= limit ? customers: customers.slice(0, limit);
    }

    private async optimizeMemoryUsage(customerMap: Map<string, CustomerFrequency>): Promise<void> {
        const startSize = customerMap.size;
        
        if (customerMap.size > 2_000_000) {
            const threshold = this.calculateMinTransactionThreshold(customerMap);
            const toRemove: string[] = [];
            
            for (const [customerId, data] of customerMap.entries()) {
                if (data.transactionCount < threshold) {
                    toRemove.push(customerId);
                }
            }
            
            for (const customerId of toRemove) {
                customerMap.delete(customerId);
            }
            
            console.log(`🧹 Memoria optimizada: ${startSize.toLocaleString()} -> ${customerMap.size.toLocaleString()} clientes`);
        }

        if (global.gc) {
            global.gc();
            console.log(`Garbage collection ejecutado`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    private calculateMinTransactionThreshold(customerMap: Map<string, CustomerFrequency>): number {
        const counts = Array.from(customerMap.values()).map(c => c.transactionCount);
        counts.sort((a, b) => a - b);
        const p25Index = Math.floor(counts.length * 0.25);
        return counts[p25Index] || 1;
    }

    private getMemoryUsage(): { used: number; total: number; percentage: number } {
        const memUsage = process.memoryUsage();
        const totalHeap = memUsage.heapTotal;
        const usedHeap = memUsage.heapUsed;
        
        return {
            used: Math.round(usedHeap / 1024 / 1024), // MB
            total: Math.round(totalHeap / 1024 / 1024), // MB
            percentage: Math.round((usedHeap / totalHeap) * 100)
        };
    }

    analyzePerformanceDetailed(dataSize: number, processingTime: number): void {
        const memUsage = this.getMemoryUsage();
        
        console.log('\n' + '='.repeat(60));
        console.log('ANÁLISIS DE RENDIMIENTO DETALLADO');
        console.log('='.repeat(60));
        
        console.log(`\nMÉTRICAS DE RENDIMIENTO:`);
        console.log(`   • Tiempo total: ${(processingTime/1000).toFixed(2)}s`);
        console.log(`   • Throughput: ${Math.round(dataSize/(processingTime/1000)).toLocaleString()} trans/seg`);
        console.log(`   • Latencia por transacción: ${(processingTime/dataSize*1000).toFixed(4)}μs`);
        
        console.log(`\nMÉTRICAS DE MEMORIA:`);
        console.log(`   • Memoria utilizada: ${memUsage.used}MB (${memUsage.percentage}%)`);
        console.log(`   • Heap total: ${memUsage.total}MB`);
    }
}

async function main(): Promise<void> {
    const analyzer = new FrequentCustomersAnalyzer();
    
    try {
        const memInfo = process.memoryUsage();
        const availableMemoryMB = Math.floor(memInfo.rss / 1024 / 1024);
        const hasLargeDatasetFlag = Deno.args.includes('--large-dataset');
        
        let datasetSize: number;
        if (hasLargeDatasetFlag) {
            datasetSize = 50_000_000;
        } else if (availableMemoryMB > 8000) {
            datasetSize = 50_000_000;
        } else if (availableMemoryMB > 4000) {
            datasetSize = 20_000_000;
        } else {
            datasetSize = 5_000_000;
        }
        
        console.log(`Memoria disponible: ~${availableMemoryMB}MB`);
        console.log(`Dataset ajustado a: ${datasetSize.toLocaleString()} transacciones`);
        
        console.log('\nGenerando dataset sintético...');
        const dataStream = analyzer.generateSyntheticDataStream(datasetSize);
        
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const now = Date.now();
        
        const limit = 10;

        console.log(`\nAnalizando top ${limit} clientes frecuentes (últimos 30 días)...`);
        
        const overallStartTime = performance.now();
        const topCustomers = await analyzer.getTopFrequentCustomersStreaming(
            dataStream, 
            thirtyDaysAgo, 
            now, 
            limit,
            {
                batchSize: 100000,
                memoryThreshold: Math.floor(datasetSize * 0.001),
                enableSpilling: true
            }
        );
        const overallEndTime = performance.now();
        
        console.log('\n' + '='.repeat(80));
        console.log(`TOP ${limit} CLIENTES MÁS FRECUENTES (ÚLTIMOS 30 DÍAS)`);
        console.log('='.repeat(80));
        console.log('Rank │ Customer ID     │ Transactions │ Total Amount │ Avg per Trans');
        console.log('─────┼─────────────────┼──────────────┼──────────────┼──────────────');
        
        topCustomers.forEach((customer, index) => {
            const avgAmount = customer.totalAmount / customer.transactionCount;
            console.log(
                `${(index + 1).toString().padStart(4)} │ ${customer.customerId} │ ${customer.transactionCount.toString().padStart(12)} │ $${customer.totalAmount.toFixed(2).padStart(11)} │ $${avgAmount.toFixed(2).padStart(11)}`
            );
        });
        
        analyzer.analyzePerformanceDetailed(
            datasetSize, 
            overallEndTime - overallStartTime
        );
        
    } catch (error) {
        console.error('Error durante el análisis:', error);
    }
}

main().catch(console.error);

// deno task 1.1
// deno task 1.1-large

export default class TaskQueuePC {
    constructor(concurrency) {
        this.taskQueue = []
        this.consumerQueue = []

        for (let i = 0; i < concurrency; i++) {
            this.consumer()
        }
    }

    consumer() {
        const that = this;
        new Promise((_, reject) => {
            (function loop() {
                that.getNextTask()
                    .then((task) => task())
                    .then(() => {
                        loop()
                    })
                    .catch((err) => {
                        reject(err)
                    })
            })()
        })
    }


    getNextTask() {
        return new Promise((resolve) => {
            if (this.taskQueue.length !== 0) {
                resolve(this.taskQueue.shift())
            } else {
                this.consumerQueue.push(resolve)
            }
        })
    }

    runTask(task) {
        return new Promise((resolve, reject) => {
            const taskWrapper = () => {
                const taskPromise = task()
                taskPromise.then(resolve, reject)
                return taskPromise;
            }

            if (this.consumerQueue.length !== 0) {
                const consumer = this.consumerQueue.shift()
                consumer(taskWrapper)
            } else {
                this.taskQueue.push(taskWrapper)
            }
        })
    }

}
/**
 * ID generation utilities
 */

let objIdCounter = 0

/**
 * Generates a MongoDB-like ObjectId
 */
const generateObjectId_ = (timestamp: number, machineId: number, processId: number, counter: number): string => {
  const hexTimestamp = Math.floor(timestamp / 1000).toString(16).padStart(8, '0')
  const hexMachineId = machineId.toString(16).padStart(6, '0')
  const hexProcessId = processId.toString(16).padStart(4, '0')
  const hexCounter = counter.toString(16).padStart(6, '0')

  return hexTimestamp + hexMachineId + hexProcessId + hexCounter
}

/**
 * Generates a unique ObjectId using current timestamp
 */
export const generateObjectId = () => generateObjectId_(Date.now(), 0, 0, objIdCounter++)
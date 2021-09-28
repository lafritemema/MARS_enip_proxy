

export interface HandledData {
}

/**
 * Abstract class defining a vendor data handler
 */
export abstract class DataHandler {
  // @ts-ignore
  public parse(dataBuff:Buffer, ...args):HandledData
  // @ts-ignore
  public encode(data:object):Buffer
}

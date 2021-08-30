interface ByteOrderFunctions {
  read:()=>number,
  write:()=>void
}

const ByteOrderEnum:Record<string, ByteOrderFunctions> = {
  LE: {
    read: Buffer.prototype.readUInt32LE,
    write: Buffer.prototype.writeUInt32LE,
  },
  BE: {
    read: Buffer.prototype.readUInt32BE,
    write: Buffer.prototype.writeUInt32BE,
  },
};

/**
 * Convert an IP string under number
 * @param {string} ipString ip string
 * @param {string} byteOrder byte order for ipNum encoding
 * @return {number} ip under number format
 */
export function convertIp2Num(ipString:string, byteOrder:string='LE'):number {
  checkByteOrder(byteOrder);
  const boFunctions = ByteOrderEnum[byteOrder];
  let ipTemp:number|string[]|number[]|Buffer;
  const errorMsg = `ERROR: IP address <${ipString}> is not conform.`;

  ipTemp = ipString.split('.');

  if (ipTemp.length == 4) {
    try {
      ipTemp = ipTemp.map((ipEl:string)=>checkAndParseIpEl(ipEl));
      return boFunctions.read.call(Buffer.from(ipTemp));
    } catch (error) {
      throw new Error(errorMsg +'\n'+(error as Error).message);
    }
  } else {
    // eslint-disable-next-line max-len
    throw new Error(errorMsg +`\nNumber of Address IP element is not conform <${ipTemp.length}> instead of 4`);
  }
}

/**
 * Convert an IP number under string
 * @param {number} ipNum IP address under number format
 * @param {string} byteOrder byte order for ipNum encoding
 * BE for Big Endian order, LE for Little Endian, default LE
 * @return {string} ip under string format
 */
export function convertNum2Ip(ipNum:number, byteOrder:string='LE'):string {
  const maxIpNumBuffer = Buffer.from([255, 255, 255, 255]);
  checkByteOrder(byteOrder);

  const boFunction = ByteOrderEnum[byteOrder];
  const maxIpNum = boFunction.read.call(maxIpNumBuffer);
  if (ipNum <= maxIpNum) {
    const ipBuffer = Buffer.alloc(4);
    // @ts-ignore
    boFunction.write.call(ipBuffer, ipNum);
    return Array.from(ipBuffer).join('.');
  } else {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The IP number <${ipNum}> is not conform, must be lower than ${maxIpNum}.`);
  }
}


/**
 * transform an IP address element under string format to nmeric format
 * and check if it is in the good range
 * @param {string} ipEl IP address element under string format
 * @return {number} Ip address element under numeric format
 */
function checkAndParseIpEl(ipEl:string):number {
  const ipNum = Number.parseInt(ipEl);
  if (ipNum <= 255 && ipNum >= 0) {
    return ipNum;
  } else {
    throw new Error(`IP element <${ipEl}> is out of range.`);
  }
}

/**
 * Check if the byte order type is conform
 * @param {string} byteOrder byte order to check
 */
function checkByteOrder(byteOrder:string) {
  if (ByteOrderEnum[byteOrder] == undefined) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The byte order <${byteOrder}> is not an valid byte order. Must be LE or BE.`);
  }
}

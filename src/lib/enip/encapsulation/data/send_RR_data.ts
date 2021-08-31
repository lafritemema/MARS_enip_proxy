import {EnipCPF, CPFJSONObject} from './cpf';
import {EnipData} from './enip_data';

interface SendRRDataJSONObject extends Object {
  interfaceHandle:number,
  timeout:number,
  enipCpf:CPFJSONObject,
}

/**
 * Class describe SendRRData command specific data
 */
export class SendRRData implements EnipData {
  private _interfaceHandle:number = 0; // interface handle 0 for CIP
  private _timeout:number;
  private _enipCpf:EnipCPF;

  /**
   * SendRRData instance constructor
   * @param {EnipCPF} enipCpf EnipCPF object describing the data
   * @param {number} timeout enip protocol timeout in second, default 0
   * When in the range 1 to 65535, the timeout shall be set to this number of seconds.
   * When is set to 0, the enip protocol shall not have its own timeout, encapsulated protocol timeout used instead.
   */
  public constructor(enipCpf:EnipCPF, timeout:number=0) {
    this._timeout = timeout;
    this._enipCpf = enipCpf;
  }

  /**
   * Get the SendRRData length in bytes
   * @return {number} SendRRData length
   */
  public get length():number {
    return this._enipCpf.length + 6;
  }

  /**
   * Parse a buffer describing the SendRR encapsulated data
   * @param {Buffer} sendRRBuff buffer describing SendRR encapsulated data
   * @return {SendRRData} a SendRRData instance
   */
  public static parse(sendRRBuff:Buffer):SendRRData {
    const interfaceHandle = sendRRBuff.readUInt32LE(0);

    checkInterfaceHandle(interfaceHandle);

    const timeout = sendRRBuff.readUInt16LE(4);
    const cpfBuff = sendRRBuff.slice(6);
    const cpf = EnipCPF.parse(cpfBuff);

    return new SendRRData(cpf, timeout);
  }

  /**
   * Encode the SendRRData instance to Buffer
   * @return {Buffer} datagram describing the SendRRData
   */
  public encode():Buffer {
    const metaBuff = Buffer.alloc(6);
    metaBuff.writeInt32LE(this._interfaceHandle, 0);
    metaBuff.writeUInt16LE(this._timeout, 4);

    const cpfBuff = this._enipCpf.encode();

    return Buffer.concat([metaBuff, cpfBuff]);
  }

  /**
   * Convert the SendRRData instance to JSON
   * @return {object} a SendRRData JSON representation
   */
  public toJSON():SendRRDataJSONObject {
    return {
      interfaceHandle: this._interfaceHandle,
      timeout: this._timeout,
      enipCpf: this._enipCpf.toJSON(),
    };
  }
}

/**
 * Check if the interface handle code in conform
 * @param {number} intHandle interface handle code
 */
function checkInterfaceHandle(intHandle:number) {
  if (intHandle!=0) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR : The CPF packet interface handle must be 0 for CIP protocol instead of ${intHandle}.`);
  }
}

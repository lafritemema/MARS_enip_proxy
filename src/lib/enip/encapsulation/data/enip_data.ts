
/**
 * Class describing Enip encapsulated data
 */
export abstract class EnipData {
  public abstract encode():Buffer;
  public abstract get length():number;
  public abstract toJSON():object;
  // @ts-ignore
  public static parse():EnipData;
}

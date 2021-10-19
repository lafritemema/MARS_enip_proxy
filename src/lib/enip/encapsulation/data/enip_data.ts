
/**
 * Class describing Enip encapsulated data
 */
export abstract class EnipData {
  public abstract encode():Buffer;
  public abstract get length():number;
  public abstract toJSON():object;
  public abstract get isSuccess():Boolean;
  public abstract get hasBody():Boolean;
  // @ts-ignore
  public static parse():EnipData;
}

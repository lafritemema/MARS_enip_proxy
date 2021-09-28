
/* eslint-disable no-unused-vars */
export enum ItemType {
    ADDR_NULL= 0X00, // address item (used for UCMM messages) Indicates that encapsulation routing is NOT needed
    LIST_IDENTITY= 0X0C, // data item
    CONNECTION_BASED= 0XA1, // address item
    CONNECTED_TRANSPORT= 0XB1, // data item
    UNCONNECTED_MESSAGE= 0XB2, // data item
    LIST_SERVICES= 0X100, // data item
    SOCKADDR_O2T= 0X8000, // data item
    SOCKADDR_T2O= 0X8001, // data item
    SEQUENCED_ADDRESS= 0X8002 // address item
}
/**
 * Check if the item type code is conform
 * @param {number} itemType item type code
 */
export function checkItemType(itemType:number) {
  if (ItemType[itemType]==undefined) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The item type code <${itemType}> is not a valid item type code.`);
  }
}

import {AddressItem} from './address_item';
import {DataItem} from './data_item';

export type ItemTypeKey = keyof typeof ItemTypeObject;

/* eslint-disable no-unused-vars */
export enum ItemType {
    ADDR_NULL= 0X00, // address item (used for UCMM messages) Indicates that encapsulation routing is NOT needed
    DATA_LIST_IDENTITY= 0X0C, // data item
    ADDR_CONNECTION_BASED= 0XA1, // address item
    DATA_CONNECTED_TRANSPORT= 0XB1, // data item
    DATA_UNCONNECTED_MESSAGE= 0XB2, // data item
    DATA_LIST_SERVICES= 0X100, // data item
    DATA_SOCKADDR_O2T= 0X8000, // data item
    DATA_SOCKADDR_T2O= 0X8001, // data item
    ADDR_SEQUENCED_ADDRESS= 0X8002 // address item
}

export const ItemTypeObject = {
  ADDR_NULL: AddressItem, // address item (used for UCMM messages) Indicates that encapsulation routing is NOT needed
  DATA_LIST_IDENTITY: DataItem, // data item
  ADDR_CONNECTION_BASED: DataItem, // address item
  DATA_CONNECTED_TRANSPORT: DataItem, // data item
  DATA_UNCONNECTED_MESSAGE: DataItem, // data item
  DATA_LIST_SERVICES: DataItem, // data item
  DATA_SOCKADDR_O2T: DataItem, // data item
  DATA_SOCKADDR_T2O: DataItem, // data item
  ADDR_SEQUENCED_ADDRESS: DataItem,
};

/* eslint-disable no-unused-vars */
export enum CPFItemType{
    ADDR_NULL=0X00, // address item (used for UCMM messages) Indicates that encapsulation routing is NOT needed
    DATA_LIST_IDENTITY=0X0C, // data item
    ADDR_CONNECTION_BASED=0XA1, // address item
    DATA_CONNECTED_TRANSPORT=0XB1, // data item
    DATA_UNCONNECTED_MESSAGE=0XB2, // data item
    DATA_LIST_SERVICES=0X100, // data item
    DATA_SOCKADDR_O2T=0X8000, // data item
    DATA_SOCKADDR_T2O=0X8001, // data item
    ADDR_SEQUENCED_ADDRESS=0X8002 // address item
}

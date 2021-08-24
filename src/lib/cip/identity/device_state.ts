/* eslint-disable no-unused-vars */

export enum DeviceState {
  NonExistent = 0,
  DeviceSelfTesting = 1,
  Standby = 2,
  Operational = 3,
  MajorRecoverableFault= 4,
  MajorUnrecoverableFault = 5,
  DefaultGetAttributesAll = 255
}

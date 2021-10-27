"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkStatusCode = exports.ResponseStatus = void 0;
/* eslint-disable no-unused-vars */
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus[ResponseStatus["Success"] = 0] = "Success";
    ResponseStatus[ResponseStatus["ConnectionFailure"] = 1] = "ConnectionFailure";
    ResponseStatus[ResponseStatus["ResourceUnavailable"] = 2] = "ResourceUnavailable";
    ResponseStatus[ResponseStatus["InvalidParameterValue"] = 3] = "InvalidParameterValue";
    ResponseStatus[ResponseStatus["PathSegmentError"] = 4] = "PathSegmentError";
    ResponseStatus[ResponseStatus["PathDestinationUnknown"] = 5] = "PathDestinationUnknown";
    ResponseStatus[ResponseStatus["PartialTransfer"] = 6] = "PartialTransfer";
    ResponseStatus[ResponseStatus["ConnectionLost"] = 7] = "ConnectionLost";
    ResponseStatus[ResponseStatus["ServiceNotSupported"] = 8] = "ServiceNotSupported";
    ResponseStatus[ResponseStatus["InvalidAttributeValue"] = 9] = "InvalidAttributeValue";
    ResponseStatus[ResponseStatus["AttributeListError"] = 10] = "AttributeListError";
    ResponseStatus[ResponseStatus["AlreadyInRequestedModeOrState"] = 11] = "AlreadyInRequestedModeOrState";
    ResponseStatus[ResponseStatus["ObjectStateConflict"] = 12] = "ObjectStateConflict";
    ResponseStatus[ResponseStatus["ObjectAlreadyExists"] = 13] = "ObjectAlreadyExists";
    ResponseStatus[ResponseStatus["AttributeNotSettable"] = 14] = "AttributeNotSettable";
    ResponseStatus[ResponseStatus["PrivilegeViolation"] = 15] = "PrivilegeViolation";
    ResponseStatus[ResponseStatus["DeviceStateConflict"] = 16] = "DeviceStateConflict";
    ResponseStatus[ResponseStatus["ReplyDataTooLarge"] = 17] = "ReplyDataTooLarge";
    ResponseStatus[ResponseStatus["FragmentationOfPrimitiveValue"] = 18] = "FragmentationOfPrimitiveValue";
    ResponseStatus[ResponseStatus["NotEnoughData"] = 19] = "NotEnoughData";
    ResponseStatus[ResponseStatus["AttributeNotSupported"] = 20] = "AttributeNotSupported";
    ResponseStatus[ResponseStatus["TooMuchData"] = 21] = "TooMuchData";
    ResponseStatus[ResponseStatus["ObjectDoesNotExist"] = 22] = "ObjectDoesNotExist";
    ResponseStatus[ResponseStatus["ServiceFragmentationSequenceNotInProgress"] = 23] = "ServiceFragmentationSequenceNotInProgress";
    ResponseStatus[ResponseStatus["NoStoredAttributeData"] = 24] = "NoStoredAttributeData";
    ResponseStatus[ResponseStatus["StoreOperationFailure"] = 25] = "StoreOperationFailure";
    ResponseStatus[ResponseStatus["RoutingFailureRequestTooLarge"] = 26] = "RoutingFailureRequestTooLarge";
    ResponseStatus[ResponseStatus["RoutingFailureResponseTooLarge"] = 27] = "RoutingFailureResponseTooLarge";
    ResponseStatus[ResponseStatus["MissingAttributeListEntryData"] = 28] = "MissingAttributeListEntryData";
    ResponseStatus[ResponseStatus["InvalidAttributeValueList"] = 29] = "InvalidAttributeValueList";
    ResponseStatus[ResponseStatus["EmbeddedServiceError"] = 30] = "EmbeddedServiceError";
    ResponseStatus[ResponseStatus["VendorSpecificError"] = 31] = "VendorSpecificError";
    ResponseStatus[ResponseStatus["InvalidParameter"] = 32] = "InvalidParameter";
    ResponseStatus[ResponseStatus["WriteOnceValueOrMediumAlreadyWritten"] = 33] = "WriteOnceValueOrMediumAlreadyWritten";
    ResponseStatus[ResponseStatus["InvalidReplyReceived"] = 34] = "InvalidReplyReceived";
    ResponseStatus[ResponseStatus["BufferOverflow"] = 35] = "BufferOverflow";
    ResponseStatus[ResponseStatus["MessageFormatError"] = 36] = "MessageFormatError";
    ResponseStatus[ResponseStatus["KeyFailureInPath"] = 37] = "KeyFailureInPath";
    ResponseStatus[ResponseStatus["PathSizeInvalid"] = 38] = "PathSizeInvalid";
    ResponseStatus[ResponseStatus["UnexpectedAttributeInList"] = 39] = "UnexpectedAttributeInList";
    ResponseStatus[ResponseStatus["InvalidMemberID"] = 40] = "InvalidMemberID";
    ResponseStatus[ResponseStatus["MemberNotSettable"] = 41] = "MemberNotSettable";
    ResponseStatus[ResponseStatus["Group2OnlyServerGeneralFailure"] = 42] = "Group2OnlyServerGeneralFailure";
    ResponseStatus[ResponseStatus["UnknownModbusError"] = 43] = "UnknownModbusError";
})(ResponseStatus = exports.ResponseStatus || (exports.ResponseStatus = {}));
/**
 * Check if the Message Type code is conform
 * @param {number} statusCode type code
 */
function checkStatusCode(statusCode) {
    // @ts-ignore
    if (ResponseStatus[statusCode] == undefined) {
        // eslint-disable-next-line max-len
        throw new Error(`ERROR: The message status <${statusCode}> is not an available message status`);
    }
}
exports.checkStatusCode = checkStatusCode;

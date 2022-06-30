
import {parse, YAMLParseError} from 'yaml';
import {readFile} from 'fs/promises';
import {Configuration} from './interfaces';
import {BaseException,
  BaseExceptionType} from './exceptions';

/**
 * fonction to read configuration from yaml file
 * and return config object
 * @param {string} yamlFile : yaml file containing the configuration
 * @return {Configuration} configuration
 */
export async function getConfigFromYaml<ConfigType extends
  Configuration>(yamlFile:string):Promise<ConfigType> {
  try {
    const yamlContent = await readFile(yamlFile);
    const configStr = yamlContent.toString('utf-8');
    const configObject = parse(configStr);
    return <ConfigType>configObject;
  } catch (error) {
    let type = null;
    let msg = null;
    if (error instanceof YAMLParseError) {
      type = BaseExceptionType.CONFIG_NOT_CONFORM;
      msg = `configuration file ${yamlFile} is not under yaml format
      ${error.message}`;
    } else {
      type = BaseExceptionType.CONFIG_MISSING;
      msg = `The configuration file ${yamlFile} not found.`;
    }
    throw new BaseException(['CONFIG'],
        type,
        msg);
  }
}

/**
 * fonction to read configuration from json file
 * and return config object
 * @param {string} jsonFile : yaml file containing the configuration
 * @return {Configuration} configuration
 */
export async function getConfigFromJson<ConfigType extends
  Configuration>(jsonFile:string):Promise<ConfigType> {
  try {
    const jsonContent = await readFile(jsonFile);
    const configStr = jsonContent.toString('utf-8');
    const configObject = JSON.parse(configStr);
    return <ConfigType>configObject;
  } catch (error) {
    let type = null;
    let msg = null;
    if (error instanceof SyntaxError) {
      type = BaseExceptionType.CONFIG_NOT_CONFORM;
      msg = `configuration file ${jsonFile} is not under json format
      ${error.message}`;
    } else {
      type = BaseExceptionType.CONFIG_MISSING;
      msg = `The configuration file ${jsonFile} not found.`;
    }
    throw new BaseException(['CONFIG'],
        type,
        msg);
  }
}

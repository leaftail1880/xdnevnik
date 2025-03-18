/**
 * MIT License
 * 
 * Copyright (c) 2024 Changwoo Yoo
 * Copyright (c) 2025 Leaftail1880
 */

const flowRemoveTypes = require("flow-remove-types");
const createSwcTransformer = require("@swc/jest").createTransformer;

const swcTransformer = createSwcTransformer();

function removeFlowTypes(src, options) {
  const flowRemoved = flowRemoveTypes(src, options).toString()

  // Flow stripping produces error prone code for react-native
  return flowRemoved.replace('(ensureNativeMethodsAreSynced                );\n', '\n')
} 

module.exports = {
  process(src, filename, jestOptions) {
    const flowRemoved = removeFlowTypes(src, jestOptions);
    return swcTransformer.process(flowRemoved, filename, jestOptions);
  },
  processAsync(src, filename, jestOptions) {
    const flowRemoved = removeFlowTypes(src);
    return swcTransformer.processAsync(flowRemoved, filename, jestOptions);
  },
  getCacheKey(src, filename, jestOptions) {
    const flowRemoved = removeFlowTypes(src);
    return swcTransformer.getCacheKey(flowRemoved, filename, jestOptions);
  },
};

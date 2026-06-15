"use strict";
// --- Types & Interfaces ---
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnifiedYieldData = getUnifiedYieldData;
// --- Helper Functions ---
/**
 * Extracts a readable symbol from a Sui coin type string.
 * e.g., "0x2::sui::SUI" -> "SUI"
 */
function extractSymbol(coinType) {
    var parts = coinType.split('::');
    return parts.length >= 3 ? parts[2].toUpperCase() : coinType.toUpperCase();
}
/**
 * Fetches lending APYs from Navi Protocol via their open configuration API endpoint.
 * Bypasses local client object initialization tracking issues for robust hackathon delivery.
 */
function fetchNaviYields() {
    return __awaiter(this, void 0, void 0, function () {
        var response, configData, yieldMap, reserves, _i, reserves_1, reserve, symbol, rawApy, apy, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('https://open-api.naviprotocol.io/contractconfigs')];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("HTTP error! status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    configData = _a.sent();
                    yieldMap = {};
                    reserves = configData.reserves || [];
                    for (_i = 0, reserves_1 = reserves; _i < reserves_1.length; _i++) {
                        reserve = reserves_1[_i];
                        if (!reserve.coinType)
                            continue;
                        symbol = extractSymbol(reserve.coinType);
                        rawApy = Number(reserve.supplyApy || reserve.supplyApr || 0);
                        apy = rawApy > 1 ? rawApy : rawApy * 100;
                        if (!yieldMap[symbol]) {
                            yieldMap[symbol] = [];
                        }
                        yieldMap[symbol].push({
                            apy: Number(apy.toFixed(2)),
                            protocol: 'Navi',
                            type: 'lending',
                            metadata: {
                                tvl: Number(reserve.totalSupply || 0),
                            }
                        });
                    }
                    return [2 /*return*/, yieldMap];
                case 3:
                    error_1 = _a.sent();
                    console.error('[Navi Protocol] Failed to fetch yield data:', error_1);
                    throw new Error("Navi Protocol API fetch failed: ".concat((error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || error_1));
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetches LP pool APYs from Cetus using their public API endpoint.
 */
function fetchCetusYields() {
    return __awaiter(this, void 0, void 0, function () {
        var response, result, yieldMap_1, pools, _loop_1, _i, pools_1, pool, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('https://api-sui.cetus.zone/v2/sui/swap/pools')];
                case 1:
                    response = _b.sent();
                    if (!response.ok) {
                        throw new Error("HTTP error! status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _b.sent();
                    yieldMap_1 = {};
                    pools = ((_a = result.data) === null || _a === void 0 ? void 0 : _a.list) || result.list || [];
                    _loop_1 = function (pool) {
                        var symbolA = extractSymbol(pool.coinTypeA);
                        var symbolB = extractSymbol(pool.coinTypeB);
                        var pairSymbol = "".concat(symbolA, "-").concat(symbolB);
                        var rawApy = pool.apy !== undefined ? pool.apy : pool.apr;
                        var apy = rawApy > 1 ? rawApy : rawApy * 100;
                        var record = {
                            apy: Number(apy.toFixed(2)),
                            protocol: 'Cetus',
                            type: 'lp',
                            metadata: {
                                pair: pairSymbol,
                                tvl: pool.tvl
                            }
                        };
                        if (!yieldMap_1[pairSymbol]) {
                            yieldMap_1[pairSymbol] = [];
                        }
                        yieldMap_1[pairSymbol].push(record);
                        [symbolA, symbolB].forEach(function (sym) {
                            if (!yieldMap_1[sym]) {
                                yieldMap_1[sym] = [];
                            }
                            var exists = yieldMap_1[sym].some(function (r) { var _a, _b; return r.protocol === record.protocol && ((_a = r.metadata) === null || _a === void 0 ? void 0 : _a.pair) === ((_b = record.metadata) === null || _b === void 0 ? void 0 : _b.pair); });
                            if (!exists) {
                                yieldMap_1[sym].push(record);
                            }
                        });
                    };
                    for (_i = 0, pools_1 = pools; _i < pools_1.length; _i++) {
                        pool = pools_1[_i];
                        _loop_1(pool);
                    }
                    return [2 /*return*/, yieldMap_1];
                case 3:
                    error_2 = _b.sent();
                    console.error('[Cetus Protocol] Failed to fetch yield data:', error_2);
                    throw new Error("Cetus Protocol API fetch failed: ".concat((error_2 === null || error_2 === void 0 ? void 0 : error_2.message) || error_2));
                case 4: return [2 /*return*/];
            }
        });
    });
}
// --- Main Router Handler ---
/**
 * Concurrently fetches yield data from Navi and Cetus with strict error isolation.
 */
function getUnifiedYieldData() {
    return __awaiter(this, void 0, void 0, function () {
        var errors, unifiedMap, _a, naviResult, cetusResult, _i, _b, _c, symbol, records, _d, _e, _f, symbol, records, _loop_2, _g, records_1, record, symbol;
        var _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    errors = [];
                    unifiedMap = {};
                    return [4 /*yield*/, Promise.allSettled([
                            fetchNaviYields(),
                            fetchCetusYields(),
                        ])];
                case 1:
                    _a = _j.sent(), naviResult = _a[0], cetusResult = _a[1];
                    if (naviResult.status === 'fulfilled') {
                        for (_i = 0, _b = Object.entries(naviResult.value); _i < _b.length; _i++) {
                            _c = _b[_i], symbol = _c[0], records = _c[1];
                            if (!unifiedMap[symbol])
                                unifiedMap[symbol] = [];
                            (_h = unifiedMap[symbol]).push.apply(_h, records);
                        }
                    }
                    else {
                        errors.push("Navi Protocol Error: ".concat(naviResult.reason.message));
                    }
                    if (cetusResult.status === 'fulfilled') {
                        for (_d = 0, _e = Object.entries(cetusResult.value); _d < _e.length; _d++) {
                            _f = _e[_d], symbol = _f[0], records = _f[1];
                            if (!unifiedMap[symbol])
                                unifiedMap[symbol] = [];
                            _loop_2 = function (record) {
                                var exists = unifiedMap[symbol].some(function (r) { var _a, _b; return r.protocol === record.protocol && ((_a = r.metadata) === null || _a === void 0 ? void 0 : _a.pair) === ((_b = record.metadata) === null || _b === void 0 ? void 0 : _b.pair); });
                                if (!exists) {
                                    unifiedMap[symbol].push(record);
                                }
                            };
                            for (_g = 0, records_1 = records; _g < records_1.length; _g++) {
                                record = records_1[_g];
                                _loop_2(record);
                            }
                        }
                    }
                    else {
                        errors.push("Cetus Protocol Error: ".concat(cetusResult.reason.message));
                    }
                    for (symbol in unifiedMap) {
                        unifiedMap[symbol].sort(function (a, b) { return b.apy - a.apy; });
                    }
                    return [2 /*return*/, {
                            data: unifiedMap,
                            errors: errors,
                            timestamp: Date.now(),
                        }];
            }
        });
    });
}

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerRouter = exports.wrapper = void 0;
const router_1 = __importDefault(require("@koa/router"));
const is_type_of_1 = __importDefault(require("is-type-of"));
const validate_1 = __importDefault(require("./validate"));
const swaggerHTML_1 = require("./swaggerHTML");
const swaggerJSON_1 = require("./swaggerJSON");
const swaggerObject_1 = __importDefault(require("./swaggerObject"));
const utils_1 = require("./utils");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const koa_compose_1 = __importDefault(require("koa-compose"));
const ramda_1 = require("ramda");
const validator = (parameters) => (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!parameters) {
        yield next();
        return;
    }
    if (parameters.query) {
        ctx.validatedQuery = (0, validate_1.default)(ctx.request.query, parameters.query);
    }
    if (parameters.path) {
        ctx.validatedParams = (0, validate_1.default)(ctx.params, parameters.path);
    }
    if (parameters.body) {
        ctx.validatedBody = (0, validate_1.default)(ctx.request.body, parameters.body);
    }
    yield next();
});
const handleDumpSwaggerJSON = (router, dumpOptions, options = {}) => {
    let data = {};
    const { dir = process.cwd(), filename = 'swagger.json' } = dumpOptions;
    Object.keys(swaggerObject_1.default.data).forEach((k) => {
        if (router.swaggerKeys.has(k)) {
            data[k] = swaggerObject_1.default.data[k];
        }
    });
    console.log(path_1.default.resolve(dir, filename));
    const jsonData = (0, swaggerJSON_1.swaggerJSON)(options, data);
    (0, fs_1.writeFileSync)(path_1.default.resolve(dir, filename), JSON.stringify(jsonData, null, 2));
};
const handleSwagger = (router, options) => {
    const { swaggerJsonEndpoint = '/swagger-json', swaggerHtmlEndpoint = '/swagger-html', prefix = '', swaggerConfiguration = {}, } = options;
    // setup swagger router
    router.get(swaggerJsonEndpoint, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        let data = {};
        if (router instanceof SwaggerRouter) {
            Object.keys(swaggerObject_1.default.data).forEach(k => {
                if (router.swaggerKeys.has(k)) {
                    data[k] = swaggerObject_1.default.data[k];
                }
            });
        }
        else {
            // 兼容使用 wrapper 的情况
            data = swaggerObject_1.default.data;
        }
        ctx.body = (0, swaggerJSON_1.swaggerJSON)(options, data);
    }));
    router.get(swaggerHtmlEndpoint, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        ctx.body = (0, swaggerHTML_1.swaggerHTML)((0, utils_1.getPath)(prefix, swaggerJsonEndpoint), swaggerConfiguration);
    }));
};
const handleMap = (router, SwaggerClass, { doValidation = true }) => {
    if (!SwaggerClass)
        return;
    const classMiddlewares = SwaggerClass.middlewares || [];
    const classPrefix = SwaggerClass.prefix || '';
    const classParameters = SwaggerClass.parameters || {};
    const classParametersFilters = SwaggerClass.parameters
        ? SwaggerClass.parameters.filters
        : ['ALL'];
    classParameters.query = classParameters.query ? classParameters.query : {};
    const staticMethods = Object.getOwnPropertyNames(SwaggerClass)
        .filter(method => !utils_1.reservedMethodNames.includes(method))
        .map((method) => {
        const func = SwaggerClass[method];
        if (typeof func !== 'object' && typeof func !== 'function') {
            return {};
        }
        func['fnName'] = method;
        return func;
    });
    const SwaggerClassPrototype = SwaggerClass.prototype;
    const methods = Object.getOwnPropertyNames(SwaggerClassPrototype)
        .filter((method) => !utils_1.reservedMethodNames.includes(method))
        .map((method) => {
        const wrapperMethod = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
            const c = new SwaggerClass(ctx);
            yield c[method](ctx);
        });
        // 添加了一层 wrapper 之后，需要把原函数的名称暴露出来 fnName
        // wrapperMethod 继承原函数的 descriptors
        const descriptors = Object.getOwnPropertyDescriptors(SwaggerClassPrototype[method]);
        Object.defineProperties(wrapperMethod, Object.assign({ fnName: {
                value: method,
                enumerable: true,
                writable: true,
                configurable: true,
            } }, descriptors));
        return wrapperMethod;
    });
    // map all methods
    [...staticMethods, ...methods]
        // add router
        .forEach((item) => {
        router._addKey(`${SwaggerClass.name}-${item.fnName}`);
        const { path, method } = item;
        if (!path || !method) {
            return;
        }
        let { middlewares = [] } = item;
        const localParams = item.parameters || {};
        if (classParametersFilters.includes('ALL') ||
            classParametersFilters.map(i => i.toLowerCase()).includes(method)) {
            const globalQuery = (0, ramda_1.clone)(classParameters.query);
            localParams.query = localParams.query ? localParams.query : {};
            // merge local query and class query
            // local query 的优先级更高
            localParams.query = Object.assign(globalQuery, localParams.query);
        }
        if (is_type_of_1.default.function(middlewares)) {
            middlewares = [middlewares];
        }
        if (!is_type_of_1.default.array(middlewares)) {
            throw new Error('middlewares params must be an array or function');
        }
        middlewares.forEach((item) => {
            if (!is_type_of_1.default.function(item)) {
                throw new Error('item in middlewares must be a function');
            }
        });
        if (!utils_1.allowedMethods.hasOwnProperty(method.toUpperCase())) {
            throw new Error(`illegal API: ${method} ${path} at [${item}]`);
        }
        const chain = [`${(0, utils_1.convertPath)(`${classPrefix}${path}`)}`];
        if (doValidation) {
            chain.push(validator(localParams));
        }
        chain.push(...classMiddlewares);
        chain.push(...middlewares);
        chain.push(item);
        router[method](...chain);
    });
};
const handleMapDir = (router, dir, options) => {
    (0, utils_1.loadSwaggerClasses)(dir, options).forEach((c) => {
        router.map(c, options);
    });
};
const handleBuildMiddleware = (router, SwaggerClass, { doValidation = true }) => {
    const meta = [];
    if (!SwaggerClass)
        return meta;
    const classMiddlewares = SwaggerClass.middlewares || [];
    const classPrefix = SwaggerClass.prefix || '';
    const classParameters = SwaggerClass.parameters || {};
    const classParametersFilters = SwaggerClass.parameters
        ? SwaggerClass.parameters.filters
        : ['ALL'];
    classParameters.query = classParameters.query ? classParameters.query : {};
    const staticMethods = Object.getOwnPropertyNames(SwaggerClass)
        .filter(method => !utils_1.reservedMethodNames.includes(method))
        .map((method) => {
        const func = SwaggerClass[method];
        func['fnName'] = method;
        return func;
    });
    const SwaggerClassPrototype = SwaggerClass.prototype;
    const methods = Object.getOwnPropertyNames(SwaggerClassPrototype)
        .filter((method) => !utils_1.reservedMethodNames.includes(method))
        .map((method) => {
        const wrapperMethod = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
            const c = new SwaggerClass(ctx);
            yield c[method](ctx);
        });
        // 添加了一层 wrapper 之后，需要把原函数的名称暴露出来 fnName
        // wrapperMethod 继承原函数的 descriptors
        const descriptors = Object.getOwnPropertyDescriptors(SwaggerClassPrototype[method]);
        Object.defineProperties(wrapperMethod, Object.assign({ fnName: {
                value: method,
                enumerable: true,
                writable: true,
                configurable: true,
            } }, descriptors));
        return wrapperMethod;
    });
    // map all methods
    [...staticMethods, ...methods]
        // filter methods withour @request decorator
        .filter((item) => {
        const { path, method } = item;
        if (!path && !method) {
            return false;
        }
        return true;
    })
        // add router
        .forEach((item) => {
        router._addKey(`${SwaggerClass.name}-${item.fnName}`);
        const { path, method } = item;
        let { middlewares = [] } = item;
        const localParams = item.parameters || {};
        if (classParametersFilters.includes('ALL') ||
            classParametersFilters.map(i => i.toLowerCase()).includes(method)) {
            const globalQuery = (0, ramda_1.clone)(classParameters.query);
            localParams.query = localParams.query ? localParams.query : {};
            // merge local query and class query
            // local query 的优先级更高
            localParams.query = Object.assign(globalQuery, localParams.query);
        }
        if (is_type_of_1.default.function(middlewares)) {
            middlewares = [middlewares];
        }
        if (!is_type_of_1.default.array(middlewares)) {
            throw new Error('middlewares params must be an array or function');
        }
        middlewares.forEach((item) => {
            if (!is_type_of_1.default.function(item)) {
                throw new Error('item in middlewares must be a function');
            }
        });
        if (!utils_1.allowedMethods.hasOwnProperty(method.toUpperCase())) {
            throw new Error(`illegal API: ${method} ${path} at [${item}]`);
        }
        const endpoint = `${(0, utils_1.convertPath)(`${classPrefix}${path}`)}`;
        const chain = [];
        if (doValidation) {
            chain.push(validator(localParams));
        }
        chain.push(...classMiddlewares);
        chain.push(...middlewares);
        meta.push({ path: endpoint, method: method.toLowerCase(), middlewares: chain, name: item.name });
    });
    return meta.map(m => ({
        path: m.path, method: m.method, middleware: (0, koa_compose_1.default)(m.middlewares), name: m.name
    }));
};
const wrapper = (router) => {
    router.swagger = (options = {}) => {
        handleSwagger(router, options);
    };
    router.map = (SwaggerClass, options = {}) => {
        handleMap(router, SwaggerClass, options);
    };
    router.mapDir = (dir, options = {}) => {
        handleMapDir(router, dir, options);
    };
};
exports.wrapper = wrapper;
class SwaggerRouter extends router_1.default {
    constructor(opts = {}, swaggerOpts = {}) {
        super(opts);
        this.opts = opts || {}; // koa-router opts
        this.swaggerKeys = new Set();
        this.swaggerOpts = swaggerOpts || {}; // swagger-router opts
        if (this.opts.prefix && !this.swaggerOpts.prefix) {
            this.swaggerOpts.prefix = this.opts.prefix;
        }
    }
    _addKey(str) {
        this.swaggerKeys.add(str);
    }
    swagger(options = {}) {
        const opts = Object.assign(options, this.swaggerOpts);
        handleSwagger(this, opts);
    }
    dumpSwaggerJson(dumpOptions, options = {}) {
        const opts = Object.assign(options, this.swaggerOpts);
        handleDumpSwaggerJSON(this, dumpOptions, opts);
    }
    map(SwaggerClass, options) {
        handleMap(this, SwaggerClass, options);
    }
    mapDir(dir, options = {}) {
        handleMapDir(this, dir, options);
    }
    // compose & create a middleware for validator & @middlewares decorators
    buildMiddleware(SwaggerClass, options) {
        return handleBuildMiddleware(this, SwaggerClass, options);
    }
}
exports.SwaggerRouter = SwaggerRouter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JhcHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL2xpYi93cmFwcGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUNBLHlEQUFpQztBQUVqQyw0REFBNEI7QUFDNUIsMERBQWtDO0FBQ2xDLCtDQUE0QztBQUM1QywrQ0FBNEM7QUFDNUMsb0VBQTRDO0FBQzVDLG1DQU1pQjtBQUVqQiwyQkFBbUM7QUFDbkMsZ0RBQXdCO0FBQ3hCLDhEQUFrQztBQUNsQyxpQ0FBOEI7QUFROUIsTUFBTSxTQUFTLEdBQUcsQ0FBQyxVQUFlLEVBQUUsRUFBRSxDQUFDLENBQ3JDLEdBQVksRUFDWixJQUF3QixFQUN4QixFQUFFO0lBQ0YsSUFBSSxDQUFDLFVBQVUsRUFBRTtRQUNmLE1BQU0sSUFBSSxFQUFFLENBQUM7UUFDYixPQUFPO0tBQ1I7SUFFRCxJQUFJLFVBQVUsQ0FBQyxLQUFLLEVBQUU7UUFDcEIsR0FBRyxDQUFDLGNBQWMsR0FBRyxJQUFBLGtCQUFRLEVBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3BFO0lBQ0QsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFO1FBQ25CLEdBQUcsQ0FBQyxlQUFlLEdBQUcsSUFBQSxrQkFBUSxFQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzdEO0lBQ0QsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFO1FBQ25CLEdBQUcsQ0FBQyxhQUFhLEdBQUcsSUFBQSxrQkFBUSxFQUFFLEdBQUcsQ0FBQyxPQUFlLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUMxRTtJQUNELE1BQU0sSUFBSSxFQUFFLENBQUM7QUFDZixDQUFDLENBQUEsQ0FBQztBQXFDRixNQUFNLHFCQUFxQixHQUFHLENBQzVCLE1BQXFCLEVBQ3JCLFdBQXdCLEVBQ3hCLFVBQTBCLEVB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
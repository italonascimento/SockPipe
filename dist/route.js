"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(msg$, type, handle) {
    return handle(msg$
        .filter(msg => msg.type === type)
        .map(msg => msg.data))
        .map(res => (Object.assign({}, res, { type })));
}
exports.default = default_1;
//# sourceMappingURL=route.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerProperty = exports.swaggerClass = void 0;
class BasePropertyOptions {
}
/**
 *
 * @param source
 */
function deepClone(source) {
    if (!source || typeof source !== 'object') {
        return null;
    }
    const targetObj = source.constructor === Array ? [] : {};
    for (const keys in source) {
        if (source.hasOwnProperty(keys)) {
            if (source[keys] && typeof source[keys] === 'object') {
                targetObj[keys] = source[keys].constructor === Array ? [] : {};
                targetObj[keys] = deepClone(source[keys]);
            }
            else {
                targetObj[keys] = source[keys];
            }
        }
    }
    return targetObj;
}
/**
 * Made for empty class
 */
function swaggerClass() {
    return function (target, propertyKey, descriptor) {
        if (target.swaggerDocument == undefined)
            target.swaggerDocument = {};
        if (target.swaggerClass == undefined)
            target.swaggerClass = target;
        if (target.swaggerClass != target) {
            target.swaggerClass = target;
            target.swaggerDocument = deepClone(target.swaggerDocument);
        }
    };
}
exports.swaggerClass = swaggerClass;
/**
 * @param options
 */
function swaggerProperty(options) {
    return function (target, propertyKey, descriptor) {
        if (target.constructor.swaggerDocument == undefined)
            target.constructor.swaggerDocument = {};
        if (target.constructor.swaggerClass == undefined)
            target.constructor.swaggerClass = target.constructor;
        if (target.constructor.swaggerClass != target.constructor) {
            target.constructor.swaggerClass = target.constructor;
            target.constructor.swaggerDocument = deepClone(target.constructor.swaggerDocument);
        }
        target.constructor.swaggerDocument[propertyKey] = options;
    };
}
exports.swaggerProperty = swaggerProperty;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dhZ2dlclByb3BlcnR5SGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vbGliL3N3YWdnZXJQcm9wZXJ0eUhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFRQSxNQUFNLG1CQUFtQjtDQU94QjtBQThDRDs7O0dBR0c7QUFDSCxTQUFTLFNBQVMsQ0FBQyxNQUFXO0lBQzFCLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO1FBQ3ZDLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFDRCxNQUFNLFNBQVMsR0FBUSxNQUFNLENBQUMsV0FBVyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDOUQsS0FBSyxNQUFNLElBQUksSUFBSSxNQUFNLEVBQUU7UUFDdkIsSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzdCLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLFFBQVEsRUFBRTtnQkFDbEQsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDL0QsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUM3QztpQkFBTTtnQkFDSCxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2xDO1NBQ0o7S0FDSjtJQUNELE9BQU8sU0FBUyxDQUFDO0FBQ3JCLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQWdCLFlBQVk7SUFDeEIsT0FBTyxVQUFVLE1BQVcsRUFBRSxXQUFtQixFQUFFLFVBQThCO1FBQzdFLElBQUksTUFBTSxDQUFDLGVBQWUsSUFBSSxTQUFTO1lBQUUsTUFBTSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7UUFDckUsSUFBSSxNQUFNLENBQUMsWUFBWSxJQUFJLFNBQVM7WUFBRSxNQUFNLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQztRQUNuRSxJQUFJLE1BQU0sQ0FBQyxZQUFZLElBQUksTUFBTSxFQUFFO1lBQy9CLE1BQU0sQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUM5RDtJQUNMLENBQUMsQ0FBQztBQUNOLENBQUM7QUFURCxvQ0FTQztBQUVEOztHQUVHO0FBQ0gsU0FBZ0IsZUFBZSxDQUFDLE9BQXlCO0lBQ3JELE9BQU8sVUFBVSxNQUFXLEVBQUUsV0FBbUIsRUFBRSxVQUE4QjtRQUM3RSxJQUFJLE1BQU0sQ0FBQyxXQUFXLENBQUMsZUFBZSxJQUFJLFNBQVM7WUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7UUFDN0YsSUFBSSxNQUFNLENBQUMsV0FBVyxDQUFDLFlBQVksSUFBSSxTQUFTO1lBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUN2RyxJQUFJLE1BQU0sQ0FBQyxXQUFXLENBQUMsWUFBWSxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUU7WUFDdkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztZQUNyRCxNQUFNLENBQUMsV0FBVyxDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUN0RjtRQUNELE1BQU0sQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxHQUFHLE9BQU8sQ0FBQztJQUM5RCxDQUFDLENBQUM7QUFDTixDQUFDO0FBVkQsMENBVUMifQ==
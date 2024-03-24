export interface BaseServiceDependencies {}

export abstract class BaseService {
    constructor(dependencies: BaseServiceDependencies) {}
}

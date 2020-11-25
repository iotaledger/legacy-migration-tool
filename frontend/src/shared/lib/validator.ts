import { ResponseTypes } from './typings/bridge';
import type {
    MessageResponse,
} from './typings/bridge'
import type { Account } from './typings/account'

type Validators = IdValidator |
    ActionValidator |
    AccountIdentifierValidator |
    AccountValidator;

export enum ErrorTypes {
    UnknownId = 'UnknownId',
    InvalidType = 'InvalidType'
};

type ErrorObject = {
    type: ErrorTypes;
    error: string;
};

type ValidationResponse = {
    isValid: boolean;
    error: ErrorObject;
};

class Validator {
    nextValidator: Validators;

    /**
     * Creates validaton response
     * 
     * @method createResponse
     * 
     * @param {boolean} isValid 
     * @param {ErrorObject} error 
     * 
     * @returns {ValidationResponse}
     */
    createResponse(isValid: boolean, error?: ErrorObject): ValidationResponse {
        return {
            isValid,
            error
        }
    }

    /**
     * Checks if response is valid
     * 
     * @method isValid
     * 
     * @param {MessageResponse} response
     * 
     * @returns {ValidationResponse}
     */
    isValid(response: MessageResponse): ValidationResponse {
        if (this.nextValidator != null) {
            return this.nextValidator.isValid(response);
        }

        return this.createResponse(true);
    }

    /**
     * Sets next validator
     * 
     * @method setNextValidator
     * 
     * @param {Validators} validator
     * 
     * @returns {ValidationResponse}
     */
    setNextValidator(validator: Validators): void {
        this.nextValidator = validator;
    }
}

/**
 * Validation for (channel) id
 */
class IdValidator extends Validator {
    ids: string[];

    /**
     * @param {string[]} ids
     * 
     * @returns {IdValidator}
     */
    constructor(ids: string[]) {
        super();

        this.ids = ids;
        return this;
    }

    /**
     * Extracts id from response
     * 
     * @method getId
     * 
     * @param {MessageResponse} response
     * 
     * @return {number}
     */
    getId(response: MessageResponse): string {
        return response.id;
    }

    /**
     * Checks if response is valid
     * 
     * @method isValid
     * 
     * @param {MessageResponse} response
     * 
     * @returns {ValidationResponse}
     */
    isValid(response: MessageResponse): ValidationResponse {
        const id = this.getId(response);

        if (!this.ids.includes(id)) {
            return super.createResponse(false, {
                type: ErrorTypes.UnknownId,
                error: 'Unknown id.'
            });
        }

        if (typeof id !== 'number') {
            return super.createResponse(false, {
                type: ErrorTypes.InvalidType,
                error: 'Invalid type of id received.'
            });
        }

        return super.isValid(response);
    }
}

/**
 * Validation for action
 */
class ActionValidator extends Validator {
    /**
     * Extracts action from response
     * 
     * @method getAction
     * 
     * @param {MessageResponse} response
     * 
     * @return {number}
     */
    getAction(response: MessageResponse): string {
        return response.action;
    }

    /**
     * Checks if response is valid
     * 
     * @method isValid
     * 
     * @param {MessageResponse} response
     * 
     * @returns {ValidationResponse}
     */
    isValid(response: MessageResponse): ValidationResponse {
        const action = this.getAction(response);

        if (typeof action !== 'string') {
            return super.createResponse(false, {
                type: ErrorTypes.InvalidType,
                error: 'Invalid type of action received.'
            });
        }

        return super.isValid(response);
    }
}

/**
 * Validation for account identifier
 */
class AccountIdentifierValidator extends Validator {
    /**
     * Checks if response is valid
     * 
     * @method isValid
     * 
     * @param {MessageResponse} response
     * 
     * @returns {ValidationResponse}
     */
    isValid(response: MessageResponse): ValidationResponse {
        const payload = response.payload;

        if (typeof payload !== 'number') {
            return super.createResponse(false, {
                type: ErrorTypes.InvalidType,
                error: 'Invalid type of payload received.'
            });
        }

        return super.isValid(response);
    }
}

/**
 * Validation for account
 */
class AccountValidator extends Validator {
    /**
     * Checks if response is valid
     * 
     * @method isValid
     * 
     * @param {MessageResponse} response
     * 
     * @returns {ValidationResponse}
     */
    isValid(response: MessageResponse): ValidationResponse {
        const payload = response.payload as Account;

        if (typeof payload.id !== 'number') {
            return super.createResponse(false, {
                type: ErrorTypes.InvalidType,
                error: 'Invalid type of id received.'
            });
        } else if (typeof payload.mnemonic !== 'string') {
            return super.createResponse(false, {
                type: ErrorTypes.InvalidType,
                error: 'Invalid type of mnemonic received.'
            });
        } else if (typeof payload.alias !== 'string') {
            return super.createResponse(false, {
                type: ErrorTypes.InvalidType,
                error: 'Invalid type of alias received.'
            });
        } else if (typeof payload.createdAt !== 'string') {
            return super.createResponse(false, {
                type: ErrorTypes.InvalidType,
                error: 'Invalid type of createdAt received.'
            });
        } else if (Array.isArray(payload.messages)) {
            return super.createResponse(false, {
                type: ErrorTypes.InvalidType,
                error: 'Invalid type of messages received.'
            });
        } else if (Array.isArray(payload.addresses)) {
            return super.createResponse(false, {
                type: ErrorTypes.InvalidType,
                error: 'Invalid type of addresses received.'
            });
        }

        return super.isValid(response);
    }
}

class ValidatorChainBuilder {
    first: Validators;
    last: Validators;

    /**
     * Adds a new validation to the validation chain
     * 
     * @method add
     * 
     * @param {Validators} validator
     * 
     * @returns {ValidatorChainBuilder} 
     */
    add(validator: Validators): ValidatorChainBuilder {
        if (!this.first) {
            this.first = validator;
            this.last = validator;
        }
        else {
            this.last.setNextValidator(validator);
            this.last = validator;
        }

        return this;
    }


    /**
     * Gets first validator in chain
     * 
     * @method getFirst
     * 
     * @returns {Validators} 
     */
    getFirst(): Validators {
        return this.first;
    }
}

export default class ValidatorService {
    validators: any;
    ids: string[];

    constructor(ids: string[]) {
        this.ids = ids;

        this.validators = {
            [ResponseTypes.StrongholdPasswordSet]: new ValidatorChainBuilder()
                .add(new IdValidator(ids))
                .add(new ActionValidator())
                .getFirst(),
            [ResponseTypes.RemovedAccount]: new ValidatorChainBuilder()
                .add(new IdValidator(ids))
                .add(new ActionValidator())
                .add(new AccountIdentifierValidator())
                .getFirst(),
            [ResponseTypes.CreatedAccount]: new ValidatorChainBuilder()
                .add(new IdValidator(ids))
                .add(new ActionValidator())
                .add(new AccountValidator())
                .getFirst(),
        };
    }

    /**
     * Performs validation
     * 
     * @method performValidation
     * 
     * @param {MessageResponse} response 
     * 
     * @returns {ValidationResponse}
     */
    performValidation(response: MessageResponse): ValidationResponse {
        return this.validators[response.type].isValid(response);
    }
}

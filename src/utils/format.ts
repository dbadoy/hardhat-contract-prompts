// getter() in hardhat-prompts.ts
// formatting from abi.type.
// address, string, ... -> string
// uint256, uint32, ... -> number 

export function formatType(type: string, value: any): any {
    switch(type) {
        case 'address':
        case 'string':
            return value.toString();

        case 'uint' :
        case 'uint256' :
        case 'uint32' :
        case 'uint8' :

        case 'int' :
        case 'int256' :
        case 'int32' :
        case 'int8' :
            return value.toString();
        
        /*
        case 'bytes' :
        case 'bytes1':
        case 'bytes2':
        case 'bytes3':
        .
        .
        .
        */

        /*
        TODO: get boolean in getter().
        case 'boolean' :
        */
    }
}
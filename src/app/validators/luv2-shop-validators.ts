import { FormControl, ValidationErrors } from "@angular/forms";

export class Luv2ShopValidators {
    // whitespace validation
    static onlyWhiteSpace(control: FormControl): ValidationErrors | null {
        if(control.value != null && control.value.trim().length == 0) {
            // string only contains whitespace --> return error object
            return {'onlyWhiteSpace': true};
        } else {
            // string contains other non-whitespace characters
            return null;
        }
}
}

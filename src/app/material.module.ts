import { NgModule } from '@angular/core';
import { MatButtonModule, MatCheckboxModule, MatTableModule, MatSortModule } from '@angular/material';

@NgModule({
    imports: [MatButtonModule, MatCheckboxModule, MatTableModule, MatSortModule],
    exports: [MatButtonModule, MatCheckboxModule, MatTableModule, MatSortModule],
})
export class MaterialModule {
}

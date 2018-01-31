import * as fs from 'fs';
import * as path from 'path';

import { DirectoryViewModel } from './../../src/models/directory-viewmodel';

const dumpFolder = (p: string) => {

    const stat = fs.statSync(p);

    const vm = new DirectoryViewModel();
    vm.id = p;
    vm.name = path.basename(p);
    vm.size = stat.size;

    if (stat.isDirectory()) {
        const items = fs.readdirSync(p);
        vm.children = new Array<DirectoryViewModel>();
        for (let i = 0; i < items.length; i++) {
            const innervm = dumpFolder(path.join(p, items[i]));
            vm.children.push(innervm);
        }
    }
    return vm;
};

const dump = dumpFolder(process.argv[2]);
const sdump = JSON.stringify(dump);
fs.writeFileSync(process.argv[3], sdump);

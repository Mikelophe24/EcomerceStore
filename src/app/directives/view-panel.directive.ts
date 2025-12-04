import { Directive } from '@angular/core';

@Directive({
  selector: '[appViewPanel]',
  host : {
    class:"border border-gray-200 rounded-xl p-6 bg-whiteng"  },

  standalone: true
})
export class ViewPanelDirective {

  constructor() { }

}

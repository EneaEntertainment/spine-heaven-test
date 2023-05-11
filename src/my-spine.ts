import { Spine } from 'pixi-spine';
import { applySpineMixin } from 'pixi-heaven';

export default class MySpine extends Spine {}

applySpineMixin(MySpine.prototype);

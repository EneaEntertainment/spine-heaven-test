import 'pixi-heaven';

import { Application } from 'pixi.js-legacy';
import MySpine from './my-spine';
import { Spine } from 'pixi-spine';

window.onload = () =>
{
    const app = new Application();

    document.body.appendChild(app.view);

    app.loader.add('boy', 'spineboy-pro.json').load((l, r) =>
    {
        // alpha works
        // const boy = new Spine(r.boy.spineData!);

        // alpha > 0 && < 1 doesn't work on mesh
        const boy = new MySpine(r.boy.spineData!);

        boy.x = app.screen.width >> 1;
        boy.y = app.screen.height - 100;
        boy.alpha = 0.15;
        boy.scale.set(0.5);
        boy.state.setAnimation(0, 'walk', true);

        app.stage.addChild(boy);
    });
};

import {assert} from 'chai';
import {ACTION_STREAM} from '../src/action-stream';
import {DispatchType, IWebSocketAction} from 'reactive-action-transport-data';

class TestActionClient implements IWebSocketAction<any> {
    dispatchOn = DispatchType.CLIENT;
    payload = null;
    type = 'testaction1';
}

class TestActionServer implements IWebSocketAction<any> {
    dispatchOn = DispatchType.SERVER;
    payload = null;
    type = 'testaction2';
}

class TestActionBoth implements IWebSocketAction<any> {
    dispatchOn = DispatchType.BOTH;
    payload = null;
    type = 'testaction3';
}

describe('ActionStream Tests', () => {
    it('export a singleton instance', () => {
        assert.isDefined(ACTION_STREAM);
    });

    it('can dispatch and hook a action', (done) => {
        const hook = ACTION_STREAM.hook(TestActionClient);
        hook.Subscribe((sender, a) => {
            assert.equal(a.type, 'testaction1');
            hook.Unsubscribe();
            done();
        });
        ACTION_STREAM.dispatch(new TestActionClient());
    });

    it('dispatch async', (done) => {
        const hook = ACTION_STREAM.hook(TestActionClient);
        let called = false;
        hook.Subscribe((sender, a) => {
            called = true;
        });
        ACTION_STREAM.dispatch(new TestActionClient());
        setTimeout(() => {
            assert.isFalse(called);
            hook.Unsubscribe();
            done();
        }, 1);
    });

    it('dispatch only client actions', (done) => {
        const hook = ACTION_STREAM.hook(TestActionServer);
        hook.Subscribe((sender, a) => {
            assert.fail();
        });
        ACTION_STREAM.dispatch(new TestActionServer());
        setTimeout(() => {
            hook.Unsubscribe();
            done();
        }, 1);
    });

    it('dispatch both', (done) => {
        const hook = ACTION_STREAM.hook(TestActionBoth);
        hook.Subscribe((sender, a) => {
            assert.equal(a.type, 'testaction3');
            hook.Unsubscribe();
            done();
        });
        ACTION_STREAM.dispatch(new TestActionBoth());
    });
});

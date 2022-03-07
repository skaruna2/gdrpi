
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src\Admin.svelte generated by Svelte v3.9.1 */

    const file = "src\\Admin.svelte";

    function create_fragment(ctx) {
    	var input0, t0, input1, t1, t2_value = (console.log(ctx.user), '') + "", t2, t3, h1, t4, t5_value = ctx.user.firstname + "", t5, t6, dispose;

    	return {
    		c: function create() {
    			input0 = element("input");
    			t0 = space();
    			input1 = element("input");
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			h1 = element("h1");
    			t4 = text("Hello ");
    			t5 = text(t5_value);
    			t6 = text("!");
    			add_location(input0, file, 7, 0, 81);
    			add_location(input1, file, 8, 0, 117);
    			add_location(h1, file, 12, 0, 180);

    			dispose = [
    				listen(input0, "input", ctx.input0_input_handler),
    				listen(input1, "input", ctx.input1_input_handler)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, input0, anchor);

    			set_input_value(input0, ctx.user.firstname);

    			insert(target, t0, anchor);
    			insert(target, input1, anchor);

    			set_input_value(input1, ctx.user.lastname);

    			insert(target, t1, anchor);
    			insert(target, t2, anchor);
    			insert(target, t3, anchor);
    			insert(target, h1, anchor);
    			append(h1, t4);
    			append(h1, t5);
    			append(h1, t6);
    		},

    		p: function update(changed, ctx) {
    			if (changed.user && (input0.value !== ctx.user.firstname)) set_input_value(input0, ctx.user.firstname);
    			if (changed.user && (input1.value !== ctx.user.lastname)) set_input_value(input1, ctx.user.lastname);

    			if ((changed.user) && t2_value !== (t2_value = (console.log(ctx.user), '') + "")) {
    				set_data(t2, t2_value);
    			}

    			if ((changed.user) && t5_value !== (t5_value = ctx.user.firstname + "")) {
    				set_data(t5, t5_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(input0);
    				detach(t0);
    				detach(input1);
    				detach(t1);
    				detach(t2);
    				detach(t3);
    				detach(h1);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let user = {
    		firstname: 'Ada',
    		lastname: 'Lovelace'
    	};

    	function input0_input_handler() {
    		user.firstname = this.value;
    		$$invalidate('user', user);
    	}

    	function input1_input_handler() {
    		user.lastname = this.value;
    		$$invalidate('user', user);
    	}

    	return {
    		user,
    		input0_input_handler,
    		input1_input_handler
    	};
    }

    class Admin extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    	}
    }

    /* src\Login.svelte generated by Svelte v3.9.1 */
    const { Object: Object_1 } = globals;

    const file$1 = "src\\Login.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object_1.create(ctx);
    	child_ctx.field = list[i];
    	return child_ctx;
    }

    // (137:2) {:else}
    function create_else_block(ctx) {
    	var h1, a, img, t0, label0, t2, input0, t3, label1, t5, input1, t6, button, t7, show_if = ctx.Object.keys(ctx.errors).length > 0, if_block1_anchor, dispose;

    	function select_block_type_1(changed, ctx) {
    		if (ctx.isLoading) return create_if_block_2;
    		return create_else_block_1;
    	}

    	var current_block_type = select_block_type_1(null, ctx);
    	var if_block0 = current_block_type(ctx);

    	var if_block1 = (show_if) && create_if_block_1(ctx);

    	return {
    		c: function create() {
    			h1 = element("h1");
    			a = element("a");
    			img = element("img");
    			t0 = space();
    			label0 = element("label");
    			label0.textContent = "Email";
    			t2 = space();
    			input0 = element("input");
    			t3 = space();
    			label1 = element("label");
    			label1.textContent = "Password";
    			t5 = space();
    			input1 = element("input");
    			t6 = space();
    			button = element("button");
    			if_block0.c();
    			t7 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr(img, "src", "https://media.glassdoor.com/sqll/276/general-dynamics-squarelogo.png");
    			attr(img, "alt", "General Dynamics");
    			add_location(img, file$1, 139, 6, 3243);
    			attr(a, "href", "https://www.gd.com/");
    			add_location(a, file$1, 138, 6, 3206);
    			attr(h1, "class", "svelte-p9mhnd");
    			add_location(h1, file$1, 137, 4, 3195);
    			attr(label0, "class", "svelte-p9mhnd");
    			add_location(label0, file$1, 142, 4, 3364);
    			attr(input0, "name", "email");
    			attr(input0, "placeholder", "name@example.com");
    			attr(input0, "class", "svelte-p9mhnd");
    			add_location(input0, file$1, 143, 4, 3389);
    			attr(label1, "class", "svelte-p9mhnd");
    			add_location(label1, file$1, 145, 4, 3467);
    			attr(input1, "name", "password");
    			attr(input1, "type", "password");
    			attr(input1, "class", "svelte-p9mhnd");
    			add_location(input1, file$1, 146, 4, 3495);
    			attr(button, "type", "submit");
    			attr(button, "class", "svelte-p9mhnd");
    			add_location(button, file$1, 148, 4, 3564);

    			dispose = [
    				listen(input0, "input", ctx.input0_input_handler),
    				listen(input1, "input", ctx.input1_input_handler)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert(target, h1, anchor);
    			append(h1, a);
    			append(a, img);
    			insert(target, t0, anchor);
    			insert(target, label0, anchor);
    			insert(target, t2, anchor);
    			insert(target, input0, anchor);

    			set_input_value(input0, ctx.email);

    			insert(target, t3, anchor);
    			insert(target, label1, anchor);
    			insert(target, t5, anchor);
    			insert(target, input1, anchor);

    			set_input_value(input1, ctx.password);

    			insert(target, t6, anchor);
    			insert(target, button, anchor);
    			if_block0.m(button, null);
    			insert(target, t7, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, if_block1_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.email && (input0.value !== ctx.email)) set_input_value(input0, ctx.email);
    			if (changed.password && (input1.value !== ctx.password)) set_input_value(input1, ctx.password);

    			if (current_block_type !== (current_block_type = select_block_type_1(changed, ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);
    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(button, null);
    				}
    			}

    			if (changed.errors) show_if = ctx.Object.keys(ctx.errors).length > 0;

    			if (show_if) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(h1);
    				detach(t0);
    				detach(label0);
    				detach(t2);
    				detach(input0);
    				detach(t3);
    				detach(label1);
    				detach(t5);
    				detach(input1);
    				detach(t6);
    				detach(button);
    			}

    			if_block0.d();

    			if (detaching) {
    				detach(t7);
    			}

    			if (if_block1) if_block1.d(detaching);

    			if (detaching) {
    				detach(if_block1_anchor);
    			}

    			run_all(dispose);
    		}
    	};
    }

    // (133:2) {#if email == 'Admin' && password == 'Admin'}
    function create_if_block(ctx) {
    	var current;

    	var logintoadmin = new Admin({ $$inline: true });

    	return {
    		c: function create() {
    			logintoadmin.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(logintoadmin, target, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(logintoadmin.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(logintoadmin.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(logintoadmin, detaching);
    		}
    	};
    }

    // (150:28) {:else}
    function create_else_block_1(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("Log in 🔒");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (150:6) {#if isLoading}
    function create_if_block_2(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("Invalid");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (153:4) {#if Object.keys(errors).length > 0}
    function create_if_block_1(ctx) {
    	var ul;

    	var each_value = ctx.Object.keys(ctx.errors);

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			ul = element("ul");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(ul, "class", "errors svelte-p9mhnd");
    			add_location(ul, file$1, 153, 6, 3699);
    		},

    		m: function mount(target, anchor) {
    			insert(target, ul, anchor);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (changed.errors || changed.Object) {
    				each_value = ctx.Object.keys(ctx.errors);

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(ul);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (155:8) {#each Object.keys(errors) as field}
    function create_each_block(ctx) {
    	var li, t0_value = ctx.field + "", t0, t1, t2_value = ctx.errors[ctx.field] + "", t2;

    	return {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = text(": ");
    			t2 = text(t2_value);
    			add_location(li, file$1, 155, 10, 3774);
    		},

    		m: function mount(target, anchor) {
    			insert(target, li, anchor);
    			append(li, t0);
    			append(li, t1);
    			append(li, t2);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.errors) && t0_value !== (t0_value = ctx.field + "")) {
    				set_data(t0, t0_value);
    			}

    			if ((changed.errors) && t2_value !== (t2_value = ctx.errors[ctx.field] + "")) {
    				set_data(t2, t2_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(li);
    			}
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var form, current_block_type_index, if_block, current, dispose;

    	var if_block_creators = [
    		create_if_block,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.email == 'Admin' && ctx.password == 'Admin') return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			form = element("form");
    			if_block.c();
    			attr(form, "class", "svelte-p9mhnd");
    			add_location(form, file$1, 131, 0, 3054);
    			dispose = listen(form, "submit", prevent_default(ctx.handleSubmit));
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, form, anchor);
    			if_blocks[current_block_type_index].m(form, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(form, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(form);
    			}

    			if_blocks[current_block_type_index].d();
    			dispose();
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let email = "";
        let password = "";
        let isLoading = false;
        let { submit } = $$props;
        let errors = {};
        const handleSubmit = () => {
        $$invalidate('errors', errors = {});

        if (email.length === 0) {
          errors.email = "empty"; $$invalidate('errors', errors);
        }
        if (password.length === 0) {
          errors.password = "empty"; $$invalidate('errors', errors);
        }

        if (Object.keys(errors).length === 0) {
          $$invalidate('isLoading', isLoading = true);
          submit({ email, password })
            .then(() => {
              $$invalidate('isLoading', isLoading = false);
            })
            .catch(err => {
              errors.server = err; $$invalidate('errors', errors);
              $$invalidate('isLoading', isLoading = false);
            });
        }
      };

    	const writable_props = ['submit'];
    	Object_1.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		email = this.value;
    		$$invalidate('email', email);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate('password', password);
    	}

    	$$self.$set = $$props => {
    		if ('submit' in $$props) $$invalidate('submit', submit = $$props.submit);
    	};

    	return {
    		email,
    		password,
    		isLoading,
    		submit,
    		errors,
    		handleSubmit,
    		Object,
    		input0_input_handler,
    		input1_input_handler
    	};
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["submit"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.submit === undefined && !('submit' in props)) {
    			console.warn("<Login> was created without expected prop 'submit'");
    		}
    	}

    	get submit() {
    		throw new Error("<Login>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set submit(value) {
    		throw new Error("<Login>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new Login({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

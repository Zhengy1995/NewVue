const _$ = selector => document.querySelector(selector)
const $A = selector => document.querySelectorAll(selector)
function NewVue() {
	this.$event = []
	this.$initedData = false
	this.$directions = ['n-bind', 'n-model']
	this._virtureDom = null
}
NewVue.prototype.$initHtmlHandler = function() {
	const changeValue = (str, ...values) => str.reduce((a, b, index) => a + b + (values[index] || ''), '')
	const dom = _$(this.$el)
	dom.template || (dom.template = dom.innerHTML)
	const template = dom.template.replace(/{{/g, '${this.').replace(/}}/g, '}')
	const changeFunc =  `changeValue\`${template}\``
	dom.innerHTML = eval(changeFunc)
}

NewVue.prototype.$updateDom = function(direction, key, value) {
	const selector = `[${direction}="${key}"]`
	this._virtureDom.querySelectorAll(selector).forEach((dom, index) => {
		const DomTemplate = dom.innerHTML.replace(new RegExp(`{{${key}}}`, 'g'), value)
		document.querySelectorAll(`${this.$el} ${selector}`)[index].innerHTML = DomTemplate
	})
}

NewVue.prototype.$render = function(key, value) {
	this.$directions.forEach(direction => {
		const doms = $A(`${this.$el} [${direction}="${key}"]`)
		switch(direction) {
			case 'n-model':
			const doms = $A(`${this.$el} [${direction}="${key}"]`)
			doms && doms.forEach(dom => {
				dom.value = value
			})
			break
			default:
			this.$updateDom(direction, key, value)
		}
	})
}
NewVue.prototype = new Proxy(NewVue.prototype, {
	set(target, key, value) {
		Reflect.set(target, key, value)
		if(target.$initedData && key in target.$data) {
			target.$render(key, value)
		}
		return true
	},
	get(target, key, value) {
		return Reflect.get(target, key, value)
	}
})

class MyVue extends NewVue {
	constructor({ el, data, methods, mounted = function(){} }) {
		super()
		this.$el = el
		this.$mounted = mounted
		this.$createVirtureDom()
		this.$data = data()
		this.$mixin(data(), true)
		this.$mixin(methods)
		this.$initEvent()
		this.$mounted()
		this.$initMVVM()
	}

	$initEvent() {
		$A(`${this.$el} [n-on]`).forEach(dom => {
			const[event, callback] = dom.getAttribute('n-on').split(',')
			dom[`on${event}`] = this[callback]
		})
	}

	$createVirtureDom () {
		const domTree = document.createElement('div')
		domTree.setAttribute('id', this.$el)
		domTree.innerHTML = _$(this.$el).innerHTML
		this._virtureDom = domTree
	}

	$initMVVM() {
		const $this = this
		$A(`${this.$el} [n-model]`).forEach(form => {
			const key = form.getAttribute('n-model')
			form.oninput = function() {
				$this.$data[key] = $this[key] = this.value
			}
		})

	}

	$mixin(obj, initData) {
		if(Object.prototype.toString.call(obj) === '[object Object]') {
			for(let key in obj) {
				this[key] = obj[key]
			}
		}
		initData && (this.$initedData = true, this.$initHtmlHandler())
	}

	$on(event, callback) {
		this.$event.push({
			event,
			callback
		})
	}

	$emit(event) {
		this.$event.forEach(evt => evt.event == event && evt.callback && evt.callback())
	}

	$off(event, callback) {
		this.$event = event ? this.$event.filter(evt => !(evt.event == event && (!callback || callback == evt.callback))) : []
	}
}

export default NewVue

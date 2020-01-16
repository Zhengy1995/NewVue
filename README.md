# NewVue
一个使用proxy实现的开箱即用的mvvm轮子

### 使用方法说明

#### 示例代码

``` bash

#HTML部分
<div id='index'>
    <input type="text" n-model='name'/>
    <span n-bind='example'>{{example}}</span> <button n-on='click,changeText'>点击切换文字</button>
</div>

#js部分
import NewVue from './NewVue'
new PersonVue({
    el: '#index',
    data() {
        return {
            example: '这是一个示例',
            name: '测试'
        }
    },
    mounted() {
        console.log('测试')
    },
    methods: {
        changeText() {
            this.example = '你点击了button标签，触发了该事件'
        }
    }
})
```

---

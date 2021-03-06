window.addEventListener('load', () => {
  const {
    mount,
    el,
    build,
    Component,
    Fragment,
    Builder,

    Provider,
    Consumer,
    createModel,
  } = Devoid;

  const ExpensiveComponent = () => Component(() => {
    build(() => {
      console.log(`Expensive Component: Should call only one time`);

      return el('p', [
        'Some expensive component',
        el('p', 'Child of expensive component')
      ])
    })
  })

  const ProviderApp = () => Component(() => {
    let modelValue = '';
    let modelTag = '';

    const DataModel = createModel((notify) => {
      console.log(`DataModel: Should call only one time`);

      let value = 'Red';

      return {
        get value() {
          return value;
        },
        setValue(newValue, tag) {
          value = newValue;
          notify(modelTag.trim() === '' ? [] : [tag]);
        }
      }
    });

    build(() => Provider({
      create: () => new DataModel(),
      child: Fragment([
        el('p', 'An element'),
        el('div', [
          el('p', 'Another element'),
          Consumer({
            models: [DataModel],
            tags: ['first'],
            builder: (context, getModel, child) => el('div', [
              el('p', `(Tag: 'first') The value is ${getModel(DataModel).value}`),
              child,
            ]),
            child: ExpensiveComponent(),
          }),
          Consumer({
            models: [DataModel],
            tags: ['second'],
            builder: (context, getModel, child) => el('p', `(Tag: 'second') The value is ${getModel(DataModel).value}`)
          }),
        ]),
        el('h4', 'New Value'),
        el('p.zust-form-el', [
          el('input.zust-input[placeholder="Enter new value"]', {
            onInput: (e) => {
              modelValue = e.target.value;
            }
          }),
        ]),
        el('h4', 'Tag'),
        el('p.zust-form-el', [
          el('input.zust-input[placeholder="Enter tag"]', {
            onInput: (e) => {
              modelTag = e.target.value;
            }
          })
        ]),
        el('br'),
        Builder((context) => el('button.zust-btn', {
          onClick: () => Provider.of(context, DataModel).setValue(modelValue, modelTag),
        }, 'Set value for tag'))
      ])
    }))
  });

  mount(ProviderApp(), document.querySelector('[renderBox]'));
});

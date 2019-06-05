<template>
  <div class="network">
    <div class="row">
      <div class="col-md-12">
        <b-form-group>
          <b-form-checkbox-group
            v-model="selected"
            :options="options"
            name="buttons-1"
            buttons
          ></b-form-checkbox-group>
        </b-form-group>
      </div>
    </div>
    <hr />
    <div class="row">
      <div class="col-md-3">
        <input type="checkbox" id="1" /><label for="1">Option 1</label><br />
        <input type="checkbox" id="2" /><label for="1">Option 2</label><br />
        <input type="checkbox" id="3" /><label for="1">Option 3</label>
      </div>
      <div class="col-md-3">
        <input type="checkbox" id="1" /><label for="1">Option 1</label><br />
        <input type="checkbox" id="2" /><label for="1">Option 2</label><br />
        <input type="checkbox" id="3" /><label for="1">Option 3</label>
      </div>
    </div>
    <hr />
  </div>
</template>

<script>
export default {
  name: 'OptionsNetwork',
  data() {
    return {
      selected: [], // Must be an array reference!
      options: [
        { text: 'Orange', value: 'orange' },
        { text: 'Apple', value: 'apple' },
        { text: 'Pineapple', value: 'pineapple' },
        { text: 'Grape', value: 'grape' },
      ],
    };
  },
};
</script>

<style scoped lang="scss">
.network {
}
</style>

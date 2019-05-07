<template>
  <div class="data">
    <div class="row">
      <div class="col-md-12">
        <b-form-select v-model="selected" :options="options" size="sm"></b-form-select>
      </div>
    </div>
    <div class="row mt-3">
      <div class="col-md-6">
        <b-form-select v-model="selected" :options="options" size="sm"></b-form-select>
        <b-form-select v-model="selected" :options="options" size="sm"></b-form-select>
        <b-form-select v-model="selected" :options="options" size="sm"></b-form-select>
      </div>
      <div class="col-md-6">
        <b-form-select v-model="selected" :options="options" size="sm"></b-form-select>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OptionsData',
  data() {
    return {
      selected: null,
      options: [
        { value: null, text: 'Please select an option' },
        { value: 'a', text: 'This is First option' },
        { value: 'b', text: 'Selected Option' },
        { value: { C: '3PO' }, text: 'This is an option with object value' },
        { value: 'd', text: 'This one is disabled', disabled: true },
      ],
    };
  },
};
</script>

<style scoped lang="scss">
.network {
}
</style>

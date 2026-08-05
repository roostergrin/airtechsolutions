<template lang="pug" src="./index.pug"></template>

<script>
import { trapFocus } from '~/resources/mixins'
import { url } from '~/resources/api'
import globalData from '~/data/globalData.json'

export default {
  mixins: [trapFocus],
  props: {
    props: {
      type: Object,
      default: () => ({})
    },
    selectedForm: {
      type: Object,
      default: () => ({})
    },
    successRedirect: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    formModels: {},
    formRecipient: '',
    formBCC: '',
    formSubject: '',
    formSubmitted: false,
    formSuccess: false,
    fullName: '',
    inputFields: [],
    mathResponse: '',
    modalOpen: false,
    postUrl: `https://aamuwi383c.execute-api.us-west-1.amazonaws.com/prod/roostergrin-emailer`,
    submissionAttempted: false
  }),
  computed: {
    a () { return Math.round(Math.random() * 10) },
    b () { return Math.round(Math.random() * 10) },
    c () { return this.a + this.b },
    captchaLabel () { return `What is ${this.a} + ${this.b}? *` }
  },
  watch: {
    selectedForm: {
      immediate: true,
      handler (val) {
        if (val && val.input_fields) {
          this.formRecipient = globalData.email
          this.formBCC = val.bcc
          this.formSubject = `${globalData.company_name} Contact Form`
          this.initiateFields()
        }
      }
    }
  },
  methods: {
    initiateFields () {
      // Creates input fields (deep clone to avoid mutating store state)
      const fields = this.selectedForm.input_fields
      const fieldsArray = Array.isArray(fields) ? fields : Object.values(fields)
      this.inputFields = JSON.parse(JSON.stringify(fieldsArray))
      this.inputFields.forEach((field, i) => {
        // Assigns unique ID
        const fieldID = `field-${i.toString().padStart(5, '0')}`
        field._id = fieldID
        // Assigns unique ID to each sub input field (for radio or checkbox)
        if (field.inputs) {
          if (!Array.isArray(field.inputs)) {
            field.inputs = Object.values(field.inputs)
          }
          field.inputs.forEach((input, e) => {
            input._id = 'subfield-' + i.toString().padStart(5, '0') + '-' + e.toString().padStart(5, '0')
          })
        }
        // Normalize select options from API
        if (field.options && !Array.isArray(field.options)) {
          field.options = Object.values(field.options)
        }

        // Sets validation rules
        if (field.acf_fc_layout === 'phone') {
          field.vValidate = { required: field.required, regex: /^[\d\s\-+()]{7,20}$/ }
        } else if (field.acf_fc_layout === 'email') {
          // field.vValidate = field.required ? 'required|email' : 'email'
          field.vValidate = { required: field.required, regex: /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})?$/ }
        } else if (field.acf_fc_layout === 'captcha') {
          field.vValidate = { required: true, is: this.c.toString() }
        } else {
          field.vValidate = field.required ? 'required' : ''
        }

        // Creates model
        const model = {
          _id: fieldID,
          label: field.label,
          model: field.acf_fc_layout === 'checkbox' ? [] : null
        }
        if (field.acf_fc_layout === 'select' && field.other_support) {
          model.otherValue = null
        }
        this.$set(this.formModels, fieldID, model)

        // Sets default inputs (for radio and checkbox)
        if (field.inputs) {
          field.inputs.forEach((input) => {
            if (input.checked) {
              if (field.acf_fc_layout === 'radio') {
                this.formModels[fieldID].model = input.label
              } else if (field.acf_fc_layout === 'checkbox') {
                this.formModels[fieldID].model.push(input.label)
              }
            }
          })
        }
      })
    },
    groupFields () {
      this.inputFieldGroups = this.inputFields.reduce((acc, field) => {
        switch (field.input_location) {
          case 'left':
            acc.left.push(field)
            break
          case 'right':
            acc.right.push(field)
            break
          default:
            acc.bottom.push(field)
        }
        return acc
      }, this.inputFieldGroups)
      console.log(this.inputFieldGroups)
    },
    validate () {
      this.$validator.validateAll()
        .then((result) => {
          if (result) {
            this.onSubmit(this.formBCC, this.formRecipient, this.formSubject)
          } else {
            const errorArr = document.querySelectorAll('.form-flexible__input--error')
            errorArr[0].focus()
          }
        })
        .catch((e) => {
          console.error(e)
        })
    },
    closeModal () {
      this.formSuccess = false
      this.formSubmitted = false
      setTimeout(() => {
        this.modalOpen = false
        const mainEl = document.getElementById('main-content')
        mainEl.focus()
      }, 150)
    },
    async onSubmit (formBCC, formRecipient, formSubject) {
      this.submissionAttempted = true

      try {
        this.formSubmitted = true

        // Creates an array of html tables, one for each input field
        const tables = []
        this.inputFields.forEach((inputField) => {
          if (this.formModels[inputField._id]) {
            const formModel = this.formModels[inputField._id]
            tables.push(`
              <table style="width: 100%; text-align: left">
                <tr>
                  <th>
                    <p style="font-size: 14px; margin-bottom: .5rem; color: #848484; font-weight: 300;">${formModel.label}</p>
                  </th>
                </tr>
                <tr>
                  <td style="width: 100%; font-size: 20px;">
                    <h5 style="margin-top: 0; padding-top: 0; font-weight: 300; border-bottom: 1px solid #3f3f3f; margin-right: 10%;">${Array.isArray(formModel.model) ? formModel.model.join(', ') : (formModel.model === 'Other' && formModel.otherValue ? 'Other: ' + formModel.otherValue : formModel.model)}</h5></td>
                </tr>
              </table>
            `)
          }
        })

        // Creates email body (including tables)
        const emailTemplate = `
          <!DOCTYPE html>
          <html>
          <body>
            <div class="container" style="background-color: #ebf5ff; padding: 1.5rem 0;">
              <div style="padding: 2rem 0; margin: 0 auto;"><img style="width: auto; height: 6rem; display: block; margin-left: auto; margin-right: auto; margin-bottom: 1rem;" src="https://www.roostergrin.com/wp-content/uploads/2019/11/rg-logo.png">
                <h1 style="font-size: 40px; margin: 0; text-align: center; width: 100%; color: #003b75;">Form Received!</h1></div>
            </div>
            <div class="section" style="background-color: #fdfdfd;">
              <div class="container" style="padding: 4rem 32px 1rem 32px; max-width: 1440px; margin: 0 auto">
                <div class="card-holder" style="padding: 7px; background-color: #e6e6e6;">
                  <div class="card-holder" style="padding: 2rem; background-color: white;">
                    ${tables.join(`<br>`)}
                  </div>
                </div>
              </div>
              <div class="container" style="padding: 0 32px 4rem 32px; max-width: 1440px; margin: 0 auto">
                <p style="color: #3f3f3f;">This form was generated from <a href=${url} target="_blank" style="text-decoration: none">${url}</a></p>
              </div>
            </div>
          </body>
          </html>
        `
        await this.$axios.$post(this.postUrl, null, {
          params: {
            bcc: formBCC,
            body: emailTemplate,
            from: globalData.email,
            subject: formSubject,
            to: formRecipient
          },
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (this.successRedirect) {
          this.$router.push(this.successRedirect)
          return
        }

        this.formSuccess = true

        setTimeout(() => {
          this.modalOpen = true
          this.$_trapFocus(this.$refs.formModal)
        }, 750)

        // Resets input fields and their modals
        setTimeout(() => {
          this.initiateFields()
        }, 1000)

        // Resets validation errors
        setTimeout(() => {
          this.errors.clear()
        }, 1100)
      } catch (e) {
        console.error(e, 'submitted')
      }
    }
  }
}
</script>

<style lang="sass" src="./index.sass" ></style>

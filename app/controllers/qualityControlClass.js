class QualityCheck {
  constructor () {
    this.qualityChecks = []
    this.globalQualityChecks = []
    this.externalQualityChecks = []
    this.results = {
      qcChecks: {},
      global: {},
      external: {},
      error: {}
    }
    this.homepage = ''
  }
  init () {
    for (let i = 0; i < this.qualityChecks.length; i++) {
      if (i === 0) {
        this.results.qcChecks = {}
      }
      let qualityCheck = this.qualityChecks[i]
      let qualityCheckName = this.qualityChecks[i][0]
      let qualityCheckID = this.qualityChecks[i][0].replace(' ', '_').toLowerCase()
      // Initalize the object
      this.results.qcChecks[qualityCheckID] = {}
      // loop through all of the quality checks that have been added and initialize each one into the results object
      this.results.qcChecks[qualityCheckID].id = this.qualityChecks[i][0].replace(' ', '_').toLowerCase()
      this.results.qcChecks[qualityCheckID].name = qualityCheckName
      this.results.qcChecks[qualityCheckID].result = []
      // If there are row headers add them
      if (qualityCheck[2]) {
        this.results.qcChecks[qualityCheckID].result.push(qualityCheck[2])
      }
    }
    // Init Global Checks
    for (let i = 0; i < this.globalQualityChecks.length; i++) {
      if (i === 0) {
        this.results.global = {}
      }
      let qualityCheck = this.globalQualityChecks[i]
      let qualityCheckName = this.globalQualityChecks[i][0]
      let qualityCheckID = this.globalQualityChecks[i][0].replace(' ', '_').toLowerCase()
      // Initalize the object
      this.results.global[qualityCheckID] = {}
      // loop through all of the quality checks that have been added and initialize each one into the results object
      this.results.global[qualityCheckID].id = qualityCheckID
      this.results.global[qualityCheckID].name = qualityCheckName
      this.results.global[qualityCheckID].result = []
      // If there are row headers add them
      if (qualityCheck[2]) {
        this.results.global[qualityCheckID].result.push(qualityCheck[2])
      }
    }

    // Init External Checks
    for (let i = 0; i < this.externalQualityChecks.length; i++) {
      if (i === 0) {
        this.results.external = {}
      }
      let qualityCheck = this.externalQualityChecks[i]
      let qualityCheckName = this.externalQualityChecks[i][0]
      let qualityCheckID = this.externalQualityChecks[i][0].replace(' ', '_').toLowerCase()
      // Initalize the object
      this.results.external[qualityCheckID] = {}
      // loop through all of the quality checks that have been added and initialize each one into the results object
      this.results.external[qualityCheckID].id = qualityCheckID
      this.results.external[qualityCheckID].name = qualityCheckName
      this.results.external[qualityCheckID].result = []
      // If there are row headers add them
      if (qualityCheck[2]) {
        this.results.external[qualityCheckID].result.push(qualityCheck[2])
      }
    }
  }
  add (name, qualityFunction, tableHeaders) {
    this.qualityChecks.push([name, qualityFunction, tableHeaders])
    console.log(this.qualityChecks)
  }
  run (pupeteerPage, url) {
    // run each one of the quality checks
    var functions = []
    for (let i = 0; i < this.qualityChecks.length; i++) {
      var checksName = this.qualityChecks[i][0]
      functions.push(this.qualityChecks[i][1](pupeteerPage, url, checksName))
    }
    return Promise.all(functions)
  }
  addGlobal (name, qualityFunction, tableHeaders) {
    this.globalQualityChecks.push([name, qualityFunction, tableHeaders])
    console.log(this.globalQualityChecks)
  }
  runGlobal (pupeteerPage, url) {
    // run each one of the quality checks
    var globalfunctions = []
    for (let i = 0; i < this.globalQualityChecks.length; i++) {
      var globalChecksName = this.globalQualityChecks[i][0]
      globalfunctions.push(this.globalQualityChecks[i][1](pupeteerPage, url, globalChecksName).then(results => {
        return results
      }))
    }
    return Promise.all(globalfunctions)
  }

  addExternal (name, qualityFunction, tableHeaders) {
    this.externalQualityChecks.push([name, qualityFunction, tableHeaders])
    console.log(this.externalQualityChecks)
  }
  runExternal (pupeteerPage, url) {
    // run each one of the quality checks
    var externalfunctions = []
    for (let i = 0; i < this.externalQualityChecks.length; i++) {
      var externalChecksName = this.externalQualityChecks[i][0]
      externalfunctions.push(this.externalQualityChecks[i][1](pupeteerPage, url, externalChecksName).then(results => {
        return results
      }))
    }
    return Promise.all(externalfunctions)
  }
  get qcResults () {
    return this.results
  }
  set qcResults (value) {
    // console.log(value.globalChecksName.replace(' ', '_').toLowerCase())
    if (Object.keys(value[0])[0] === 'globalChecksName') {
      for (let i = 0; i < value.length; i++) {
        let id = value[i].globalChecksName.replace(' ', '_').toLowerCase()
        // check if this objects exists
        this.results.global[id].result.push(value[i].results)
      }
    } else if (Object.keys(value[0])[0] === 'externalChecksName') {
      for (let i = 0; i < value.length; i++) {
        let id = value[i].externalChecksName.replace(' ', '_').toLowerCase()
        // check if this objects exists
        this.results.external[id].result.push(value[i].results)
      }
    } else {
      for (let checkIndex = 0; checkIndex < value.length; checkIndex++) {
        let check = value[checkIndex]
        let id = check.checkName.replace(' ', '_').toLowerCase()
        if (check.results !== null) {
          for (let i = 0; i < check.results.length; i++) {
            this.results.qcChecks[id].result.push(check.results[i])
          }
        }
      }
    }
  }
  set error (pageError) {
    if (!('error' in this.results.qcChecks)) {
      this.results.error = []
    }
    this.results.error.push(pageError)
  }
  addJob (jobId) {
    this.results.jobId = jobId
  }
}
module.exports = QualityCheck

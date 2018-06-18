class QualityCheck {
  constructor () {
    this.qualityChecks = []
    this.globalQualityChecks = []
    this.results = {}
  }
  init () {
    for (let i = 0; i < this.qualityChecks.length; i++) {
      if (i === 0) {
        this.results.qcChecks = {}
      }
      let qaualityCheck = this.qualityChecks[i]
      let qualityCheckName = this.qualityChecks[i][0]
      let qualityCheckID = this.qualityChecks[i][0].replace(' ', '_').toLowerCase()
      // Initalize the object
      this.results.qcChecks[qualityCheckID] = {}
      // loop through all of the quality checks that have been added and initialize each one into the results object
      this.results.qcChecks[qualityCheckID].id = this.qualityChecks[i][0].replace(' ', '_').toLowerCase()
      this.results.qcChecks[qualityCheckID].name = qualityCheckName
      this.results.qcChecks[qualityCheckID].results = []
      // If there are row headers add them
      if (qaualityCheck[2]) {
        this.results.qcChecks[qualityCheckID].results.push(qaualityCheck[2])
      }
    }
    // Init Global Checks
    for (let i = 0; i < this.globalQualityChecks.length; i++) {
      if (i === 0) {
        this.results.global = {}
      }
      let qaualityCheck = this.globalQualityChecks[i]
      let qualityCheckName = this.globalQualityChecks[i][0]
      let qualityCheckID = this.globalQualityChecks[i][0].replace(' ', '_').toLowerCase()
      // Initalize the object
      this.results.global[qualityCheckID] = {}
      // loop through all of the quality checks that have been added and initialize each one into the results object
      this.results.global[qualityCheckID].id = qualityCheckID
      this.results.global[qualityCheckID].name = qualityCheckName
      this.results.global[qualityCheckID].results = []
      // If there are row headers add them
      if (qaualityCheck[2]) {
        this.results.global[qualityCheckID].results.push(qaualityCheck[2])
      }
    }
  }
  add (name, qualityFunction, tableHeaders) {
    this.qualityChecks.push([name, qualityFunction, tableHeaders])
    console.log(this.qualityChecks)
  }
  run (pupeteerPage, url) {
    // run each one of the quality checks
    for (let i = 0; i < this.qualityChecks.length; i++) {
      let checkResults = this.qualityChecks[i][1](pupeteerPage, url)
      this.results.qcChecks[this.qualityChecks[i][0]].results.push(checkResults)
    }
  }
  addGlobal (name, qualityFunction, tableHeaders) {
    this.globalQualityChecks.push([name, qualityFunction, tableHeaders])
    console.log(this.globalQualityChecks)
  }
  runGlobal (pupeteerPage, url) {
    // run each one of the quality checks
    for (let i = 0; i < this.qualityChecks.length; i++) {
      let checkResults = this.qualityChecks[i][1](pupeteerPage, url)
      this.results.qcChecks[this.qualityChecks[i][0]].results.push(checkResults)
    }
  }
  results () {
    if (Object.keys(this.results.qcChecks).length) {
      return undefined
    }
    return this.results.qcChecks
  }
  error (pageError) {
    if (!('error' in this.results.qcChecks)) {
      this.results.qcChecks.error = []
    }
    this.results.qcChecks.error.push(pageError)
  }
  clear () {
    this.qualityChecks = []
    this.globalQualityChecks = []
    this.results = {}
  }
  addJob (jobId) {
    this.results.jobId = jobId
  }
}
module.exports = QualityCheck

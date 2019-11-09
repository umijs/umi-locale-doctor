import EventEmitter from 'events'
import ora from 'ora'

import { PARSE_EVENTS } from '@/src/types/events'
import { toPercent } from '@/src/helpers/cal'

export default class ProgressPrinter {
  private emitter: EventEmitter
  private type: string

  private spinner: ora.Ora = null
  private spinnerTotal: number = null
  private spinnerCounted: number = 0

  constructor(emitter: EventEmitter, type: string) {
    this.emitter = emitter
    this.type = type
  }

  public start() {
    this.emitter.on(PARSE_EVENTS.START, (files: string[]) => {
      this.spinner = ora(`Parsing ${this.type} 0%`).start()
      this.spinnerTotal = files.length
      if (!files.length) {
        this.spinner.succeed()
      }
    })

    this.emitter.on(PARSE_EVENTS.PARSED, (file: string) => {
      this.spinnerCounted++
      this.spinner.text = `Parsing ${this.type} ${toPercent(this.spinnerTotal, this.spinnerCounted)}% => ${file
        .replace(process.cwd(), '')
        .slice(1)}`

      if (this.spinnerCounted === this.spinnerTotal) {
        this.spinner.succeed()
      }
    })
  }
}

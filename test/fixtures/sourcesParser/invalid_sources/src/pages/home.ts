import { formatMessage, formatHTMLMessage, FormattedMessage, FormattedHTMLMessage } from 'umi-plugin-react/locale'
function test() {}

export default () => {
  return (
    <div>
      {formatMessage({ title: 'name' })}
      {formatHTMLMessage({ name: 'name' })}
      <FormattedMessage />
      <FormattedHTMLMessage nanfeng />

      {formatMessage()}
      {formatMessage({ id: [] })}
      {test()}
    </div>
  )
}

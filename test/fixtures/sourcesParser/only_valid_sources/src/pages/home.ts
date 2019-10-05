import { formatMessage, formatHTMLMessage, FormattedMessage, FormattedHTMLMessage } from 'umi-plugin-react/locale'

export default () => {
  return (
    <div>
      {formatMessage({ id: 'name' })}
      {formatHTMLMessage({ id: 'name' })}
      <FormattedMessage id="name" />
      <FormattedHTMLMessage id="name" />
    </div>
  )
}

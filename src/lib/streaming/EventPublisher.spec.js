import EventPublisher from './EventPublisher'
import logger from '../../services/logger'

import { Kinesis } from '../../utils/AWSMocks'

describe(EventPublisher, () => {
  let kinesis
  let publisher
  let info

  const event = 'ExampleEvent'
  let payload

  beforeEach( () => {
    payload = {
      id: 'deadbeef',
      key: 'some arbitrary value'
    }

    kinesis = new Kinesis()
    kinesis.putRecord.mockResolvedValue(true)

    info = jest.spyOn(logger, 'info')
    info.mockReturnValue(true)

    publisher = new EventPublisher(kinesis, 'example-stream', { logger })
  })

  describe('behaviour', () => {
    describe('params', () => {
      it('calls PutRecord with the right stream', async () => {
        publisher.publish(event, payload)

        expect(kinesis.putRecord).toHaveBeenCalledWith(
          expect.objectContaining({
            StreamName: 'example-stream'
          })
        )
      })

      it('uses $.id as partition key if we have it', async () => {
        publisher.publish(event, payload)

        expect(kinesis.putRecord).toHaveBeenCalledWith(
          expect.objectContaining({
            PartitionKey: 'deadbeef'
          })
        )
      })

      it('includes Data', async () => {
        publisher.publish(event, payload)

        const params = kinesis.putRecord.mock.calls[0][0]
        expect(typeof(params.Data)).toBe('string')
        expect(params.Data.length > 42).toBe(true)
      })

      it('pads data with a new line', async () => {
        publisher.publish(event, payload)

        const params = kinesis.putRecord.mock.calls[0][0]
        expect(params.Data.substring(params.Data.length - 2)).toBe('\r\n')
      })

    })

    describe('data', () => {
      it('assigns a UUID() as $.id', async () => {
        publisher.publish(event, payload)

        const params = kinesis.putRecord.mock.calls[0][0]
        const data = JSON.parse(params.Data)

        expect(typeof(data.id)).toBe('string')
        expect(data.id.length > 32).toBeTruthy()
      })

      it('assigns a timestamp', async () => {
        publisher.publish(event, payload)

        const params = kinesis.putRecord.mock.calls[0][0]
        const data = JSON.parse(params.Data)

        expect(typeof(data.timestamp)).toBe('string')
        expect(data.id.length).toBe(36)
      })

      it('reuses event in the payload', async () => {
        publisher.publish(event, payload)

        const params = kinesis.putRecord.mock.calls[0][0]
        const data = JSON.parse(params.Data)

        expect(data.event).toBe(event)
      })

      it('passes actor in', async () => {
        publisher.publish(event, payload, { iss: 'issuer', sub: 'submarine' })

        const params = kinesis.putRecord.mock.calls[0][0]
        const data = JSON.parse(params.Data)

        expect(data.actor).toMatchObject({
          iss: 'issuer',
          sub: 'submarine'
        })
      })

      it('passes the payload', async () => {
        publisher.publish(event, payload, 'some kind of actor')

        const params = kinesis.putRecord.mock.calls[0][0]
        const data = JSON.parse(params.Data)

        expect(data.payload).toMatchObject({
          'id': 'deadbeef',
          'key': 'some arbitrary value'
        })
      })
    })
  })
})

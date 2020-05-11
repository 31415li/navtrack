using System;
using System.Linq;
using Navtrack.Library.DI;
using Navtrack.Listener.Helpers;
using Navtrack.Listener.Helpers.New;
using Navtrack.Listener.Models;
using Navtrack.Listener.Server;

namespace Navtrack.Listener.Protocols.Megastek
{
    [Service(typeof(ICustomMessageHandler<MegastekProtocol>))]
    public class MegastekMessageHandler : BaseMessageHandler<MegastekProtocol>
    {
        public override Location Parse(MessageInput input)
        {
            Location location = Parse(input, Parse_V1, Parse_V2, Parse_V3);

            return location;
        }

        private static Location Parse_V1(MessageInput input)
        {
            GPRMC gprmc = new GPRMC(string.Join(",", input.DataMessage.CommaSplit.Skip(2).Take(13)));

            Location location = new Location(gprmc)
            {
                Device = new Device
                {
                    IMEI = input.DataMessage.CommaSplit[17].Replace("imei:", string.Empty)
                },
                Satellites = input.DataMessage.CommaSplit.Get<short>(18),
                Altitude = input.DataMessage.CommaSplit.Get<decimal?>(19)
            };

            return location;
        }

        private static Location Parse_V2(MessageInput input)
        {
            string imei = input.DataMessage.Reader.Skip(3).Get(16).Replace(" ", string.Empty);

            GPRMC gprmc = new GPRMC(input.DataMessage.Reader.Skip(2).GetUntil('*', 3));

            Location location = new Location(gprmc)
            {
                Device = new Device
                {
                    IMEI = imei
                },
                GsmSignal = input.DataMessage.CommaSplit.Get<short?>(17)
            };

            return location;
        }

        private static Location Parse_V3(MessageInput input)
        {
            Location location = new Location
            {
                Device = new Device
                {
                    IMEI = input.DataMessage.CommaSplit[1]
                },
                Latitude = GpsUtil.ConvertDmmLatToDecimal(input.DataMessage.CommaSplit[7],
                    input.DataMessage.CommaSplit[8]),
                Longitude = GpsUtil.ConvertDmmLongToDecimal(input.DataMessage.CommaSplit[9],
                    input.DataMessage.CommaSplit[10]),
                DateTime = GetDate(input.DataMessage.CommaSplit[4], input.DataMessage.CommaSplit[5]),
                Satellites = input.DataMessage.CommaSplit.Get<short?>(12),
                HDOP = input.DataMessage.CommaSplit.Get<decimal?>(14),
                Speed = SpeedUtil.KnotsToKph(input.DataMessage.CommaSplit.Get<decimal>(15)),
                Heading = input.DataMessage.CommaSplit.Get<decimal?>(16),
                Altitude = input.DataMessage.CommaSplit.Get<decimal?>(17),
                Odometer = input.DataMessage.CommaSplit.Get<double?>(18) * 1000,
                GsmSignal = input.DataMessage.CommaSplit.Get<short?>(23)
            };

            return location;
        }

        private static DateTime GetDate(string date, string time)
        {
            MessageReader dateReader = new MessageReader(date);
            MessageReader timeReader = new MessageReader(time);

            (string day, string month, string year) = (dateReader.Get(2), dateReader.Get(2), dateReader.Get(2));
            (string hour, string minute, string second) = (timeReader.Get(2), timeReader.Get(2), timeReader.Get(2));

            return DateTimeUtil.New(year, month, day, hour, minute, second);
        }
    }
}
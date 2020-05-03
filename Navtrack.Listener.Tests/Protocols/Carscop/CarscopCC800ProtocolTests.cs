using Navtrack.Listener.Protocols.Carscop;
using NUnit.Framework;

namespace Navtrack.Listener.Tests.Protocols.Carscop
{
    // ReSharper disable once InconsistentNaming
    public class CarscopCC800ProtocolTests
    {
        private IProtocolTester protocolTester;

        [SetUp]
        public void Setup()
        {
            protocolTester = new ProtocolTester(new CarscopProtocol(), new CarscopMessageHandler());
        }

        [Test]
        public void DeviceSendsLocationLoginMessage_LocationIsParsed()
        {
            protocolTester.SendStringFromDevice(
                "*040331141830UB05CW0800C12345678013255A2240.8419N11408.8178E000.104033129.2011111111L000023^");

            Assert.AreEqual("*040331141830DX061^", protocolTester.ReceiveStringInDevice());
        }

        [Test]
        public void DeviceSendsLocationV1_LocationIsParsed()
        {
            protocolTester.SendStringFromDevice(
                "*040331141830UD04013255A2267.6805N11415.1885E000.104033129.2011111111L000023^");

            Assert.IsNotNull(protocolTester.LastParsedLocation);
        }
    }
}
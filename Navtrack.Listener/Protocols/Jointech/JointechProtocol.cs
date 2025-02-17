using Navtrack.Library.DI;
using Navtrack.Listener.Server;

namespace Navtrack.Listener.Protocols.Jointech;

[Service(typeof(IProtocol))]
public class JointechProtocol : BaseProtocol
{
    public override int Port => 7040;
    public override byte[] MessageStart => new byte[] {0x24};
}
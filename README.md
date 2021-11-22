# member-profiler
A tool for showing the access patterns in member variables.

To use, just include ValueInstrumenter.h, and wrap the desired member variables.
Example:

```cpp
#include "ValueInstrumenter.h"

class MyClass
{
public:

	Instrumenter<int> myInstrumentedInt{ "Label 1", "Label 2", 5 };
	int myOtherwiseIdenticalInt{ 5 };
}

```

Note that this is meant to "just work" if you drop it in- all operators are overloaded to resolve to the underlying operator. However, it's worth noting that this does not play particularly well with templates, incurs a performance penalty, and will not correctly instrument fields that are accessed via member-object pointer (since there's no way within the standard to see this happen).
Anything where you rely on ABI shenanigans (such as having a specific class layout) may break with this, however trivial things like type-punning will continue to work as before.
Due to these caveats, it is not recommended to leave classes instrumented in release environments. It is only meant for debugging and entertainment purposes.

This will create a `dump.csv` file in the working directory of your executable when you call `Inst::Dump()`. This can then be fed into the provided D3 demo to visualize the access pattern of your class.

[WIP]


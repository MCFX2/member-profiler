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
This will create a `dump.csv` file in the working directory of your executable when you terminate it. This can then be fed into the provided D3 demo to visualize the access pattern of your class.

[WIP]


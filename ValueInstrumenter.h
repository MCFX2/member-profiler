#pragma once

#include <string>
#include <vector>
#include <map>

struct IInfo
{
	std::string l1{};
	std::string l2{};

	size_t m_timesPointedTo{ 0 };
	size_t m_timesDereferenced{ 0 };
	size_t m_timesWrittenTo{ 0 };
	size_t m_timesAccessedDirectly{ 0 };
	size_t m_underlyingSize{ 0 };
};

class Inst
{
public:

	static void Register(std::string l1, std::string l2, size_t tpt, size_t tdr, size_t twt, size_t tad, size_t inSize)
	{
		m_info.push_back({ l1, l2, tpt, tdr, twt, tad, inSize });
	}

	static void Dump(std::string const& filename = "dump.csv")
	{
		std::string lblLine{ "category,variable,varrSize,timesPointedTo,timesDereferenced,timesWrittenTo,timesReadFrom\n" };
		for (auto const& e : m_info)
		{
			//write csv
			std::string outputLine{
				e.l1 + ","
				+ e.l2 + ","
				+ std::to_string(e.m_underlyingSize) + ","
				+ std::to_string(e.m_timesPointedTo) + ","
				+ std::to_string(e.m_timesDereferenced) + ","
				+ std::to_string(e.m_timesWrittenTo) + ","
				+ std::to_string(e.m_timesAccessedDirectly) + "\n" };

			lblLine += outputLine;
		}
		//write output to file
		FILE* k{nullptr};
		fopen_s(&k, filename.c_str(), "w");
		if (k)
		{
			fwrite(lblLine.c_str(), 1, lblLine.length(), k);
			fclose(k);
		}
		else
		{
			__debugbreak();
		}
		m_info.clear();
	}
private:

	static inline std::vector<IInfo> m_info;
};

template<typename T>
class Instrumenter
{
public:
	Instrumenter(std::string const& category, std::string const& label) 
		: m_category{ category }
		, m_label{ label } 
	{}

	Instrumenter(Instrumenter<T> const& rhs)
		: m_category{ rhs.m_category }
		, m_label{ rhs.m_label }
		, m_underlying{ rhs.m_underlying }
	{}

	//Instrumenter(T&& val) : m_underlying{ val } {}

	template<typename ... Args>
	Instrumenter(std::string const& category, std::string const& label, Args... args) 
		: m_category{ category }
		, m_label{ label }
		, m_underlying{ std::forward<Args>(args)... }
	{}

	~Instrumenter()
	{
		Inst::Register(m_category, m_label, m_timesPointedTo, m_timesDereferenced, m_timesWrittenTo, m_timesAccessedDirectly, m_underlyingSize);
	}

	Instrumenter<T>& operator=(T const& rhs)
	{
		m_timesWrittenTo++;
		m_underlying = rhs;
		return *this;
	}

	Instrumenter<T>& operator+=(T const& rhs)
	{
		m_timesWrittenTo++;
		m_underlying += rhs;
		return *this;
	}

	Instrumenter<T>& operator-=(T const& rhs)
	{
		m_timesWrittenTo++;
		m_underlying -= rhs;
		return *this;
	}

	Instrumenter<T>& operator*=(T const& rhs)
	{
		m_timesWrittenTo++;
		m_underlying *= rhs;
		return *this;
	}

	Instrumenter<T>& operator/=(T const& rhs)
	{
		m_timesWrittenTo++;
		m_underlying /= rhs;
		return *this;
	}

	Instrumenter<T>& operator%=(T const& rhs)
	{
		m_timesWrittenTo++;
		m_underlying %= rhs;
		return *this;
	}

	Instrumenter<T>& operator^=(T const& rhs)
	{
		m_timesWrittenTo++;
		m_underlying ^= rhs;
		return *this;
	}

	Instrumenter<T>& operator&=(T const& rhs)
	{
		m_timesWrittenTo++;
		m_underlying &= rhs;
		return *this;
	}

	Instrumenter<T>& operator>>=(T const& rhs)
	{
		m_timesWrittenTo++;
		m_underlying >>= rhs;
		return *this;
	}

	Instrumenter<T>& operator<<=(T const& rhs)
	{
		m_timesWrittenTo++;
		m_underlying <<= rhs;
		return *this;
	}

	Instrumenter<T>& operator|=(T const& rhs)
	{
		m_timesWrittenTo++;
		m_underlying |= rhs;
		return *this;
	}


	T operator->()
	{
		m_timesDereferenced++;
		return m_underlying;
	}

	decltype(auto) operator->() const
	{
		m_timesDereferenced++;
		return m_underlying;
	}

	T* operator&()
	{
		m_timesPointedTo++;
		return &m_underlying;
	}

	operator T()
	{
		m_timesAccessedDirectly++;
		return m_underlying;
	}

	operator T() const
	{
		m_timesAccessedDirectly++;
		return m_underlying;
	}

	template<typename U>
	decltype(auto) operator-(U const& rhs)
	{
		m_timesAccessedDirectly++;
		return m_underlying - rhs;
	}

	template<typename U>
	decltype(auto) operator-(U const& rhs) const
	{
		m_timesAccessedDirectly++;
		return m_underlying - rhs;
	}

	template<typename U>
	decltype(auto) operator+(U const& rhs)
	{
		m_timesAccessedDirectly++;
		return m_underlying + rhs;
	}

	template<typename U>
	decltype(auto) operator+(U const& rhs) const
	{
		m_timesAccessedDirectly++;
		return m_underlying + rhs;
	}

	template<typename U>
	decltype(auto) operator*(U const& rhs)
	{
		m_timesAccessedDirectly++;
		return m_underlying * rhs;
	}

	template<typename U>
	decltype(auto) operator*(U const& rhs) const
	{
		m_timesAccessedDirectly++;
		return m_underlying * rhs;
	}

	template<typename U>
	decltype(auto) operator/(U const& rhs)
	{
		m_timesAccessedDirectly++;
		return m_underlying / rhs;
	}

	template<typename U>
	decltype(auto) operator/(U const& rhs) const
	{
		m_timesAccessedDirectly++;
		return m_underlying / rhs;
	}

	template<typename U>
	decltype(auto) operator%(U const& rhs)
	{
		m_timesAccessedDirectly++;
		return m_underlying % rhs;
	}

	template<typename U>
	decltype(auto) operator%(U const& rhs) const
	{
		m_timesAccessedDirectly++;
		return m_underlying % rhs;
	}

	decltype(auto) operator+()
	{
		m_timesAccessedDirectly++;
		return +m_underlying;
	}

	decltype(auto) operator+() const
	{
		m_timesAccessedDirectly++;
		return +m_underlying;
	}

	decltype(auto) operator-()
	{
		m_timesAccessedDirectly++;
		return -m_underlying;
	}

	decltype(auto) operator-() const
	{
		m_timesAccessedDirectly++;
		return -m_underlying;
	}

	decltype(auto) operator++()
	{
		m_timesAccessedDirectly++;
		m_timesWrittenTo++;
		return ++m_underlying;
	}

	decltype(auto) operator++(int)
	{
		m_timesAccessedDirectly++;
		m_timesWrittenTo++;
		return m_underlying++;
	}

	decltype(auto) operator--()
	{
		m_timesAccessedDirectly++;
		m_timesWrittenTo++;
		return --m_underlying;
	}

	decltype(auto) operator--(int)
	{
		m_timesAccessedDirectly++;
		m_timesWrittenTo++;
		return --m_underlying;
	}

	template<typename U>
	decltype(auto) operator==(U const& rhs) const
	{
		m_timesAccessedDirectly++;
		return m_underlying == rhs;
	}

	template<typename U>
	decltype(auto) operator!=(U const& rhs) const
	{
		m_timesAccessedDirectly++;
		return m_underlying != rhs;
	}

	template<typename U>
	decltype(auto) operator>=(U const& rhs) const
	{
		m_timesAccessedDirectly++;
		return m_underlying >= rhs;
	}

	template<typename U>
	decltype(auto) operator<=(U const& rhs) const
	{
		m_timesAccessedDirectly++;
		return m_underlying <= rhs;
	}

	template<typename U>
	decltype(auto) operator>(U const& rhs) const
	{
		m_timesAccessedDirectly++;
		return m_underlying > rhs;
	}

	template<typename U>
	decltype(auto) operator<(U const& rhs) const
	{
		m_timesAccessedDirectly++;
		return m_underlying < rhs;
	}

	decltype(auto) operator!()
	{
		m_timesAccessedDirectly++;
		return !m_underlying;
	}

	decltype(auto) operator!() const
	{
		m_timesAccessedDirectly++;
		return !m_underlying;
	}

	decltype(auto) operator~() const
	{
		m_timesAccessedDirectly++;
		return ~m_underlying;
	}

	template<typename U>
	decltype(auto) operator&(U const& rhs) const
	{
		m_timesAccessedDirectly++;
		return m_underlying & rhs;
	}

	template<typename U>
	decltype(auto) operator|(U const& rhs) const
	{
		m_timesAccessedDirectly++;
		return m_underlying | rhs;
	}

	template<typename U>
	decltype(auto) operator^(U const& rhs) const
	{
		m_timesAccessedDirectly++;
		return m_underlying ^ rhs;
	}

	template<typename U>
	decltype(auto) operator<<(U const& rhs) const
	{
		m_timesAccessedDirectly++;
		return m_underlying << rhs;
	}

	template<typename U>
	decltype(auto) operator>>(U const& rhs) const
	{
		m_timesAccessedDirectly++;
		return m_underlying >> rhs;
	}


private:
	T m_underlying{};

	std::string m_label{ "Unknown" };
	std::string m_category{ "Unknown" };

	//metrics
	mutable size_t m_timesPointedTo{ 0 };
	mutable size_t m_timesDereferenced{ 0 };
	mutable size_t m_timesWrittenTo{ 0 };
	mutable size_t m_timesAccessedDirectly{ 0 };
	mutable size_t m_underlyingSize{ sizeof(T) };
};

template<typename T, typename U>
decltype(auto) operator-(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs - rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator+(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs + rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator*(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs * rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator/(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs / rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator%(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs % rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator==(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs == rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator!=(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs != rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator>=(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs >= rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator<=(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs <= rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator>(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs > rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator<(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs < rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator&(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs & rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator|(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs | rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator^(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs ^ rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator<<(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs << rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator>>(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs >> rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator+=(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs += rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator-=(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs -= rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator*=(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs *= rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator/=(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs /= rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator%=(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs %= rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator&=(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs &= rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator|=(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs |= rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator^=(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs ^= rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator<<=(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs <<= rhs.operator U();
}

template<typename T, typename U>
decltype(auto) operator>>=(T const& lhs, Instrumenter<U> const& rhs)
{
	return lhs >>= rhs.operator U();
}

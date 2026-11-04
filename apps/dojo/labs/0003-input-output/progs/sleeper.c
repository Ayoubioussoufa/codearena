/* Never ends, but uses no CPU at all: it just sleeps. */
#include <unistd.h>

int main(void)
{
	sleep(60);
	return 0;
}

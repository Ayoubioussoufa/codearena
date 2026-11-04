/* Sends itself the one signal nothing can catch. */
#include <signal.h>

int main(void)
{
	raise(SIGKILL);
	return 0;
}

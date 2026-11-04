/* Refuses the polite signals, then spins. Only one signal can stop it. */
#include <signal.h>

int main(void)
{
	volatile unsigned long n = 0;

	signal(SIGTERM, SIG_IGN);
	signal(SIGINT, SIG_IGN);
	signal(SIGHUP, SIG_IGN);
	for (;;)
		n++;
}

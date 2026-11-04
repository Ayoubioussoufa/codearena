/*
 * Starts a grandchild that leaves your process group (setsid), then spins.
 * The grandchild runs `sleep 23.1406`, so it's easy to find afterwards.
 */
#include <unistd.h>

int main(void)
{
	volatile unsigned long n = 0;

	if (fork() == 0) {
		setsid();
		execlp("sleep", "sleep", "23.1406", (char *)0);
		_exit(127);
	}
	for (;;)
		n++;
}

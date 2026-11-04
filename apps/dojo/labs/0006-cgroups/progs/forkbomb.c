/* Tries to start 1000 sleeping children, then reports how many it got. */
#include <stdio.h>
#include <unistd.h>

int main(void)
{
	int ok = 0;

	for (int i = 0; i < 1000; i++) {
		pid_t p = fork();
		if (p == 0) {
			sleep(30);
			_exit(0);
		}
		if (p < 0)
			break;
		ok++;
	}
	printf("forked %d\n", ok);
	return 0;
}
